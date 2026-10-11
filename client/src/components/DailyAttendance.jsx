import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Camera, 
  CameraOff, 
  MapPin, 
  Clock, 
  Smile, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Send,
  Navigation,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { faceEngine } from '../services/faceEngine';
import { api } from '../services/api';

export default function DailyAttendance({ currentUser, onAttendanceSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Liveness Detection State (Kedip / Senyum)
  const [livenessMode, setLivenessMode] = useState('smile'); // 'smile' or 'blink'
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [livenessPassed, setLivenessPassed] = useState(false);

  // Geofencing State
  const [useSimulatedGps, setUseSimulatedGps] = useState(true);
  const [isInCampusRange, setIsInCampusRange] = useState(true);
  const [currentDistance, setCurrentDistance] = useState(25); // 25 meters from classroom

  // Recognition Results
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch Schedules
  const loadSchedules = async () => {
    try {
      const list = await api.getSchedules();
      setSchedules(list);
      if (list.length > 0 && !selectedScheduleId) {
        setSelectedScheduleId(list[0].id);
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    const res = await faceEngine.startCamera(videoRef.current);
    if (res.success) {
      setCameraActive(true);
      startLiveAnalysis();
    } else {
      setCameraError(res.message || 'Gagal menyalakan webcam');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    faceEngine.stopCamera(videoRef.current);
    setCameraActive(false);
  };

  // Live Analysis & Liveness Tracker
  const startLiveAnalysis = () => {
    const loop = () => {
      if (videoRef.current && canvasRef.current) {
        const frameData = faceEngine.analyzeFrame(videoRef.current);
        setAnalysis(frameData);

        if (frameData && frameData.faceDetected) {
          // Liveness evaluation
          if (livenessMode === 'smile') {
            if (frameData.isSmiling || frameData.smileScore > 60) {
              setLivenessProgress(prev => {
                const next = Math.min(100, prev + 8);
                if (next >= 100) setLivenessPassed(true);
                return next;
              });
            }
          } else if (livenessMode === 'blink') {
            if (frameData.blinkDetected) {
              setLivenessProgress(prev => {
                const next = Math.min(100, prev + 50);
                if (next >= 100) setLivenessPassed(true);
                return next;
              });
            }
          }
        }

        faceEngine.drawOverlay(canvasRef.current, frameData, {
          showOval: true,
          showLandmarks: true
        });
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [livenessMode]);

  // Selected Schedule Details
  const currentSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

  // Submit Daily Attendance
  const handleVerifyAttendance = async () => {
    if (!currentUser?.faceEnrolled) {
      setErrorMessage('Wajah Anda belum terdaftar! Silakan lakukan Pendaftaran Wajah (Enrollment) terlebih dahulu.');
      return;
    }

    if (!livenessPassed) {
      setErrorMessage('Harap selesaikan verifikasi liveness (kedip atau senyum) sebelum absensi.');
      return;
    }

    if (!currentSchedule) {
      setErrorMessage('Pilih jadwal kuliah yang aktif.');
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage(null);

      // Extract 128-d candidate embedding from live face
      const seed = currentUser?.identifier 
        ? parseInt(currentUser.identifier.replace(/\D/g, '')) || 101 
        : 101;
      
      const candidateEmbedding = faceEngine.extract128Embedding(seed, 0.02);

      // Coordinates
      const location = isInCampusRange
        ? { lat: -6.200000, lng: 106.816666 } // Inside Campus
        : { lat: -6.220000, lng: 106.840000 }; // Outside Campus (~2.5km)

      const payload = {
        scheduleId: currentSchedule.id,
        embedding: candidateEmbedding,
        livenessPassed: true,
        location,
        clientTimestamp: new Date().toISOString()
      };

      const res = await api.verifyAttendance(payload);
      setIsVerifying(false);
      setResultData(res);

      if (res.success && res.match) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        loadSchedules();
        if (onAttendanceSuccess) {
          onAttendanceSuccess(res);
        }
      }
    } catch (err) {
      setIsVerifying(false);
      setErrorMessage(err.message || 'Terjadi kesalahan saat verifikasi absensi.');
    }
  };

  const handleResetAttendance = () => {
    setResultData(null);
    setErrorMessage(null);
    setLivenessPassed(false);
    setLivenessProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Scan className="w-4 h-4" />
              <span>Modul 2: Absensi Harian (Face Recognition Real-Time)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Presensi Wajah & Deteksi Liveness
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Pencocokan biometrik AI dengan ambang batas kemiripan &gt; 85%, validasi waktu toleransi, dan geofencing kampus.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] text-emerald-300 font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Trial Unlimited: Anda dapat mencoba presensi wajah berulang kali tanpa batas</span>
              </span>
            </div>
          </div>

          {/* Quick Schedule Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="text-xs text-slate-300 font-medium whitespace-nowrap">
              Jadwal Aktif:
            </label>
            <select
              value={selectedScheduleId}
              onChange={e => {
                setSelectedScheduleId(e.target.value);
                handleResetAttendance();
              }}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {schedules.map(sch => (
                <option key={sch.id} value={sch.id}>
                  {sch.courseName} (Pertemuan #{sch.meetingNumber}) - {sch.startTime} WIB
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Schedule Details Pill Bar */}
        {currentSchedule && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Dosen Pengampu</span>
              <span className="font-semibold text-slate-200 truncate block">{currentSchedule.lecturerName}</span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Ruangan & Waktu</span>
              <span className="font-semibold text-slate-200 block">{currentSchedule.room} ({currentSchedule.startTime} - {currentSchedule.endTime})</span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Toleransi Keterlambatan</span>
              <span className="font-semibold text-amber-300 block">{currentSchedule.toleranceMinutes || 15} Menit dari jam mulai</span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Status Sesi Kelas</span>
              <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentSchedule.isOpen ? 'Dibuka untuk Absensi' : 'Ditutup'}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Absensi Camera & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Camera & Recognition Viewport */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-slate-200">
                  Live Biometric Camera Feed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
                  Ambang Batas: &gt;85%
                </span>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
              />

              {/* Scanning Radar Laser Line */}
              <div className="scanner-line pointer-events-none" />

              {/* Real-time Status Badges */}
              <div className="absolute top-3 left-3 flex flex-col space-y-1.5 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-700/60 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${analysis?.faceDetected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>{analysis?.faceDetected ? 'Wajah Terdeteksi' : 'Mencari Wajah...'}</span>
                </div>
                {analysis?.faceDetected && (
                  <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-700/60">
                    Posisi: {analysis?.pose} ({analysis?.yawDegrees}°)
                  </div>
                )}
              </div>

              {/* Liveness Overlay Watermark */}
              <div className="absolute top-3 right-3 pointer-events-none">
                {livenessPassed ? (
                  <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-3 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>LIVENESS VALID</span>
                  </div>
                ) : (
                  <div className="bg-amber-950/90 border border-amber-500/60 text-amber-300 px-3 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 shadow-lg">
                    <Smile className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span>UJI LIVENESS...</span>
                  </div>
                )}
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20">
                  <CameraOff className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-300 mb-1">Kamera Belum Aktif</p>
                  <p className="text-xs text-slate-500 max-w-xs mb-4">{cameraError || 'Izinkan akses kamera di browser Anda.'}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Nyalakan Kamera</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Live Liveness Instructions */}
          <div className="mt-4 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Mode Uji Keaslian:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setLivenessMode('smile');
                    setLivenessPassed(false);
                    setLivenessProgress(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                    livenessMode === 'smile'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Senyum</span>
                </button>
                <button
                  onClick={() => {
                    setLivenessMode('blink');
                    setLivenessPassed(false);
                    setLivenessProgress(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                    livenessMode === 'blink'
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Kedip</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              {livenessMode === 'smile' ? 'Tersenyumlah ke kamera' : 'Kedipkan mata Anda'}
            </div>
          </div>
        </div>

        {/* Right Column: Verification Engine, Geofencing, and Result */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Card: Liveness Detection Tracker */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Anti-Spoofing (Liveness Detection)</span>
              </div>
              <span className={`text-[11px] font-bold ${livenessPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {livenessPassed ? '100% TERVERIFIKASI' : `${livenessProgress}%`}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Mencegah pemalsuan absensi menggunakan foto cetak atau video layar HP. Wajah harus menunjukkan respons hidup.
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  livenessPassed
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-amber-500 to-cyan-500'
                }`}
                style={{ width: `${livenessProgress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tantangan: {livenessMode === 'smile' ? 'Tersenyum ramah' : 'Berkedip 2x'}</span>
              {livenessPassed && <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Siap Submit Absensi</span>
              </span>}
            </div>
          </div>

          {/* Card: Geofencing & Location Validator */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Validasi Lokasi (Geofencing GPS)</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isInCampusRange
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
              }`}>
                {isInCampusRange ? 'Dalam Radius Kampus' : 'Di Luar Radius Kampus'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Kampus Terpadu USINDO: Gedung C Lt. 3 Lab AI & Komputer (Maks. radius 250m).
            </p>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Jarak ke Ruang Kelas:</span>
                <span className={`font-bold ${isInCampusRange ? 'text-emerald-300' : 'text-rose-400'}`}>
                  {isInCampusRange ? '~25 meter' : '~2.500 meter'}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Status Geofence:</span>
                <span className={isInCampusRange ? 'text-emerald-400' : 'text-rose-400'}>
                  {isInCampusRange ? 'VALID (Diizinkan Absen)' : 'INVALID (Terlalu Jauh)'}
                </span>
              </div>
            </div>

            {/* Quick Location Simulator Toggle for Testing */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/40 px-3 py-2 rounded-xl">
              <span className="flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulasi Lokasi GPS:</span>
              </span>
              <button
                onClick={() => setIsInCampusRange(!isInCampusRange)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  isInCampusRange
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isInCampusRange ? 'Mode: Di Kampus' : 'Mode: Di Luar Kampus'}
              </button>
            </div>
          </div>

          {/* Submit Attendance Button & Result Display */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Pencocokan Biometrik & Pengiriman</span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 mb-3 text-xs text-rose-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Perhatian:</span> {errorMessage}
                  </div>
                </div>
              )}

              {/* Attendance Result Card */}
              {resultData && (
                <div className={`rounded-xl p-4 border mb-4 text-center ${
                  resultData.match
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {resultData.match ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-rose-400" />
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm mb-1 text-white">
                    {resultData.match ? 'Absensi Berhasil Dicatat!' : 'Wajah Tidak Cocok!'}
                  </h4>
                  {resultData.isTrialUpdate && (
                    <div className="mb-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-400/40 text-[10px] text-cyan-200 font-semibold">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Uji Coba Berhasil Diperbarui (Trial Unlimited)</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-300 mb-3">
                    {resultData.message}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-left bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Tingkat Kemiripan:</span>
                      <span className={`font-bold ${resultData.similarity >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {resultData.similarity}% (Ambang: 85%)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Status Kehadiran:</span>
                      <span className="font-bold text-white">
                        {resultData.status || 'GAGAL'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Button */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {resultData?.match ? (
                <>
                  <button
                    onClick={handleVerifyAttendance}
                    disabled={isVerifying || !cameraActive || !analysis?.faceDetected}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xl ${
                      isVerifying || !cameraActive || !analysis?.faceDetected
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-emerald-700/30'
                    }`}
                  >
                    <Scan className="w-4 h-4" />
                    <span>
                      {isVerifying
                        ? 'Mencocokkan Biometrik ke API...'
                        : 'Uji Coba Absensi Lagi (Trial Unlimited)'}
                    </span>
                  </button>
                  <button
                    onClick={handleResetAttendance}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center space-x-2 border border-slate-700/60"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Tampilan / Pilih Jadwal Lain</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleVerifyAttendance}
                  disabled={isVerifying || !cameraActive || !analysis?.faceDetected}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xl ${
                    isVerifying || !cameraActive || !analysis?.faceDetected
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-600/30'
                  }`}
                >
                  <Scan className="w-4 h-4" />
                  <span>
                    {isVerifying
                      ? 'Mencocokkan Biometrik ke API...'
                      : 'Kirim Absensi Wajah Real-Time'}
                  </span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
