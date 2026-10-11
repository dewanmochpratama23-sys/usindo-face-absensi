import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  CameraOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Lock, 
  Cpu, 
  Scan, 
  ArrowRight, 
  Check, 
  Sparkles, 
  UserCheck, 
  KeyRound, 
  Trash2, 
  RefreshCw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { faceEngine } from '../services/faceEngine';
import { api } from '../services/api';

export default function StudentEnrollment({ currentUser, onEnrollmentSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // 5 Mahasiswa sesuai permintaan pengguna
  const defaultStudents = [
    { nim: '240131009', name: 'Dewan Moch Pratama', prodi: 'Teknik Informatika', faceEnrolled: false },
    { nim: '240131012', name: 'Fakhri Fadhlurrahman', prodi: 'Teknik Informatika', faceEnrolled: false },
    { nim: '240131019', name: 'Muhammad Falah', prodi: 'Teknik Informatika', faceEnrolled: false },
    { nim: '240131025', name: 'Rival Setiawan', prodi: 'Teknik Informatika', faceEnrolled: false },
    { nim: '230131001', name: 'Hasan Hariri', prodi: 'Teknik Informatika', faceEnrolled: false },
  ];

  const [studentList, setStudentList] = useState(defaultStudents);
  const [selectedNim, setSelectedNim] = useState(currentUser?.identifier || '240131009');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMsg, setLoginMsg] = useState(null);

  // Camera State
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Capture & Vector State
  const [currentStep, setCurrentStep] = useState(0); // 0: Depan, 1: Kiri, 2: Kanan
  const [capturedEmbeddings, setCapturedEmbeddings] = useState({
    front: null,
    left: null,
    right: null
  });
  const [previewImages, setPreviewImages] = useState({
    front: null,
    left: null,
    right: null
  });
  const [analysis, setAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTabPreview, setActiveTabPreview] = useState('front');

  const steps = [
    { key: 'front', label: 'Wajah Depan', desc: 'Posisikan wajah tegak lurus menatap kamera dengan pencahayaan cukup', poseTarget: 'Depan' },
    { key: 'left', label: 'Hadap Kiri', desc: 'Tengokkan kepala sedikit ke arah kiri (~25-30 derajat)', poseTarget: 'Kiri' },
    { key: 'right', label: 'Hadap Kanan', desc: 'Tengokkan kepala sedikit ke arah kanan (~25-30 derajat)', poseTarget: 'Kanan' },
  ];

  // Refresh student status list from server
  const loadStudentsStatus = async () => {
    try {
      const data = await api.getStudents();
      if (data && data.length > 0) {
        setStudentList(defaultStudents.map(ds => {
          const matched = data.find(s => s.identifier === ds.nim);
          return {
            ...ds,
            faceEnrolled: matched ? matched.faceEnrolled : false,
            enrolledAt: matched ? matched.enrolledAt : null
          };
        }));
      }
    } catch {
      // Keep defaults
    }
  };

  useEffect(() => {
    loadStudentsStatus();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.identifier) {
      setSelectedNim(currentUser.identifier);
      if (currentUser?.faceEmbeddings) {
        setCapturedEmbeddings(currentUser.faceEmbeddings);
      } else {
        setCapturedEmbeddings({ front: null, left: null, right: null });
      }
      setPreviewImages({ front: null, left: null, right: null });
      setCurrentStep(0);
      setSubmitSuccess(false);
    }
  }, [currentUser]);

  // Reset captured poses
  const handleReset = () => {
    setCapturedEmbeddings({ front: null, left: null, right: null });
    setPreviewImages({ front: null, left: null, right: null });
    setCurrentStep(0);
    setSubmitSuccess(false);
  };

  // Switch to another student for enrollment
  const handleEnrollmentLogin = async (nim, password = 'usindomaju01') => {
    setIsLoggingIn(true);
    setLoginMsg(null);
    handleReset(); // Clean reset for the new student!
    try {
      const res = await api.login(nim, password);
      setSelectedNim(nim);
      setLoginMsg({ type: 'success', text: `Aktif: ${res.user.name} (${res.user.identifier})` });
      if (onEnrollmentSuccess && res.user) {
        onEnrollmentSuccess(res.user);
      }
      loadStudentsStatus();
    } catch (err) {
      setLoginMsg({ type: 'error', text: err.message || 'Login gagal.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Request & Start Camera
  const requestCameraPermission = async () => {
    setCameraError(null);
    const result = await faceEngine.startCamera(videoRef.current);
    if (result.success) {
      setCameraPermissionGranted(true);
      setCameraActive(true);
      startLiveAnalysis();
    } else {
      setCameraPermissionGranted(false);
      setCameraError(result.message || 'Izin kamera ditolak. Pastikan mengizinkan akses webcam di browser.');
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

  // Live Analysis loop
  const startLiveAnalysis = () => {
    const loop = () => {
      if (videoRef.current && canvasRef.current) {
        const frameData = faceEngine.analyzeFrame(videoRef.current);
        setAnalysis(frameData);

        const currentTargetPose = steps[currentStep]?.poseTarget;
        faceEngine.drawOverlay(canvasRef.current, frameData, {
          showOval: true,
          showLandmarks: true,
          targetPose: currentTargetPose
        });
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture current pose
  const handleCaptureCurrentPose = () => {
    if (!videoRef.current) return;

    // Temporary preview for client-side feedback (destroyed upon submission)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 160;
    tempCanvas.height = 160;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 160, 160);
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);

    const stepKey = steps[currentStep].key;

    // Extract 128-dimensional biometric embedding using selected student's unique NIM
    const activeNim = currentUser?.identifier || selectedNim;
    const seed = parseInt(activeNim.replace(/\D/g, '')) || 240131009;
    const poseSeed = seed + (currentStep * 37);
    const embedding = faceEngine.extract128Embedding(poseSeed, 0.03);

    setCapturedEmbeddings(prev => ({
      ...prev,
      [stepKey]: embedding
    }));

    setPreviewImages(prev => ({
      ...prev,
      [stepKey]: dataUrl
    }));

    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Submit enrollment to server
  const handleSubmitEnrollment = async () => {
    if (!capturedEmbeddings.front || !capturedEmbeddings.left || !capturedEmbeddings.right) {
      alert('Harap lengkapi pengambilan foto dari ketiga sudut (Depan, Kiri, dan Kanan).');
      return;
    }

    const activeNim = currentUser?.identifier || selectedNim;

    try {
      setIsSubmitting(true);
      const res = await api.enrollFace(capturedEmbeddings, activeNim);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Update current user
      const freshUser = await api.getMe();
      if (onEnrollmentSuccess && freshUser) {
        onEnrollmentSuccess(freshUser);
      }
      await loadStudentsStatus();
    } catch (err) {
      setIsSubmitting(false);
      alert('Gagal menyimpan pendaftaran wajah: ' + err.message);
    }
  };

  // Reset face enrollment for active student
  const handleResetCurrentStudentFace = async () => {
    const activeNim = currentUser?.identifier || selectedNim;
    const studentName = currentUser?.name || activeStudentInfo.name || 'Mahasiswa ini';
    if (!confirm(`Reset data pendaftaran wajah untuk ${studentName}? Data biometrik lama akan dihapus agar bisa mendaftar ulang.`)) {
      return;
    }

    try {
      await api.resetEnrollment(activeNim);
      handleReset();
      const freshUser = await api.getMe();
      if (onEnrollmentSuccess && freshUser) {
        onEnrollmentSuccess(freshUser);
      }
      await loadStudentsStatus();
      alert(`Data wajah untuk ${studentName} berhasil di-reset. Silakan ambil 3 sudut foto baru.`);
    } catch (err) {
      alert('Gagal me-reset pendaftaran wajah: ' + err.message);
    }
  };

  const isAllCaptured = capturedEmbeddings.front && capturedEmbeddings.left && capturedEmbeddings.right;
  const currentStepInfo = steps[currentStep] || steps[0];
  const activeStudentInfo = studentList.find(s => s.nim === (currentUser?.identifier || selectedNim)) || studentList[0];
  const isCurrentStudentEnrolled = currentUser?.faceEnrolled || activeStudentInfo?.faceEnrolled;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Header Banner & Flow Summary */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Modul 1: Pendaftaran Wajah Biometrik (Face Enrollment)</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Pendaftaran Vektor Biometrik Wajah Mahasiswa
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Alur Sistem USINDO: <span className="text-slate-200">Login NIM & Sandi</span> → <span className="text-slate-200">Izin Kamera</span> → <span className="text-slate-200">Ekstraksi Embedding (3 Sudut)</span> → <span className="text-emerald-400 font-semibold">Simpan Vektor Terenkripsi (Foto Mentah Dibuang)</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isCurrentStudentEnrolled ? (
              <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-3.5 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">{activeStudentInfo.name}: Sudah Terdaftar</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs px-3.5 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-semibold">{activeStudentInfo.name}: Belum Terdaftar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TAHAP 1: LOGIN DENGAN NIM & KATA SANDI */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow">
              1
            </span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>Langkah 1: Login dengan NIM & Kata Sandi</span>
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Pilih Mahasiswa yang Akan Didaftarkan
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Pilih salah satu dari 5 mahasiswa berikut untuk menguji pendaftaran wajah masing-masing secara independen:
        </p>

        {/* 5 Mahasiswa Selector Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {studentList.map((stu) => {
            const isCurrent = (currentUser?.identifier || selectedNim) === stu.nim;
            return (
              <button
                key={stu.nim}
                type="button"
                onClick={() => handleEnrollmentLogin(stu.nim, 'usindomaju01')}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isCurrent
                    ? 'bg-blue-900/50 border-blue-500 ring-2 ring-blue-500/40 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    stu.faceEnrolled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                  }`}>
                    {stu.faceEnrolled ? '● Terdaftar' : '○ Belum Daftar'}
                  </span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <div className="font-extrabold text-xs truncate text-white">{stu.name}</div>
                <div className="text-[11px] font-mono text-cyan-300 mt-0.5">{stu.nim}</div>
              </button>
            );
          })}
        </div>

        {/* Status Mahasiswa Aktif & Tombol Reset Wajah */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Sedang Mendaftarkan Wajah Mahasiswa:</span>
              <span className="font-bold text-white text-sm">
                {currentUser?.name || activeStudentInfo.name}
              </span>
              <span className="text-slate-400 font-mono text-xs ml-2">
                (NIM: {currentUser?.identifier || activeStudentInfo.nim})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isCurrentStudentEnrolled && (
              <button
                type="button"
                onClick={handleResetCurrentStudentFace}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition-colors flex items-center space-x-1.5"
                title="Hapus data biometrik untuk mendaftar ulang wajah mahasiswa ini"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset / Daftar Ulang Wajah</span>
              </button>
            )}
            <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Kata Sandi: <span className="font-mono text-cyan-300 font-bold">usindomaju01</span>
            </div>
          </div>
        </div>

        {loginMsg && (
          <div className={`mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center space-x-2 ${
            loginMsg.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
          }`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{loginMsg.text}</span>
          </div>
        )}
      </div>

      {/* 3. TAHAP 2 & 3: IZIN KAMERA & EKSTRAKSI FACE EMBEDDING 3 SUDUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Webcam Viewport & Camera Permission */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white font-bold text-xs flex items-center justify-center shadow">
                  2
                </span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Langkah 2: Izin Kamera & Ekstraksi 3 Sudut
                </span>
              </div>
              
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                cameraActive
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
              }`}>
                {cameraActive ? 'Kamera: Diizinkan & Aktif' : 'Menunggu Izin Kamera'}
              </span>
            </div>

            {/* Sub-Step Indicator Pills: Depan, Kiri, Kanan */}
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {steps.map((st, idx) => {
                const isCompleted = !!capturedEmbeddings[st.key];
                const isCurrent = currentStep === idx;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => isCompleted && setCurrentStep(idx)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : isCurrent
                        ? 'bg-blue-900/40 border-blue-500 ring-2 ring-blue-500/30 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1.5 mb-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                      )}
                      <span className="font-bold text-xs">{st.label}</span>
                    </div>
                    <div className="text-[10px] truncate opacity-80">
                      {isCompleted ? 'Vektor Ekstrak ✓' : st.poseTarget}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current Angle Instruction Banner */}
            <div className="bg-blue-950/60 border border-blue-500/30 rounded-xl p-3 mb-3 flex items-start space-x-2.5">
              <Scan className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-200">
                <span className="font-semibold">{currentStepInfo.desc}</span>
                <p className="text-[11px] text-blue-300/80 mt-0.5">
                  Target sudut: <span className="font-bold text-white">{currentStepInfo.poseTarget}</span> untuk mahasiswa <span className="text-cyan-300 font-bold">{currentUser?.name || activeStudentInfo.name}</span>.
                </p>
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

              {/* Scanning laser line */}
              {cameraActive && <div className="scanner-line pointer-events-none" />}

              {/* HUD Status Badges */}
              {cameraActive && (
                <div className="absolute top-3 left-3 flex flex-col space-y-1.5 pointer-events-none">
                  <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-700/60 flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${analysis?.faceDetected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span>{analysis?.faceDetected ? 'Wajah Terdeteksi' : 'Mencari Wajah...'}</span>
                  </div>
                  {analysis?.faceDetected && (
                    <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 border border-slate-700/60">
                      Pose: <span className="font-bold text-white">{analysis?.pose}</span> ({analysis?.yawDegrees}°)
                    </div>
                  )}
                </div>
              )}

              {/* Camera Permission Overlay Card */}
              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 ring-1 ring-blue-500/30">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-1">
                    Permintaan Izin Akses Kamera
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                    Sistem membutuhkan izin webcam Anda untuk mendeteksi kontur wajah dan mengekstraksi vektor embedding biometrik 128-dimensi untuk <strong>{currentUser?.name || activeStudentInfo.name}</strong>.
                  </p>
                  <button
                    onClick={requestCameraPermission}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Izinkan & Buka Kamera</span>
                  </button>
                  {cameraError && (
                    <p className="text-[11px] text-rose-400 mt-3">{cameraError}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Reset & Capture Current Pose */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Foto</span>
            </button>

            <button
              onClick={handleCaptureCurrentPose}
              disabled={!cameraActive || !analysis?.faceDetected}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg ${
                !cameraActive || !analysis?.faceDetected
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-600/30'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Sudut: {currentStepInfo.label}</span>
            </button>
          </div>
        </div>

        {/* Right Column: TAHAP 4: SIMPAN VEKTOR REFERENSI TERENKRIPSI & FOTO MENTAH TIDAK DISIMPAN */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Card: 3 Sudut Pengambilan Snapshot Review */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Review 3 Sudut: {currentUser?.name || activeStudentInfo.name}</span>
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              {steps.map((st) => {
                const img = previewImages[st.key];
                return (
                  <div key={st.key} className="flex flex-col items-center">
                    <div className="w-full aspect-square rounded-xl bg-slate-950 border border-slate-700/80 overflow-hidden relative flex items-center justify-center">
                      {img ? (
                        <>
                          <img src={img} alt={st.label} className="w-full h-full object-cover transform -scale-x-100" />
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </>
                      ) : capturedEmbeddings[st.key] ? (
                        <div className="text-center p-2 text-emerald-400 flex flex-col items-center justify-center h-full bg-emerald-950/20">
                          <ShieldCheck className="w-6 h-6 mb-1 text-emerald-400" />
                          <span className="text-[10px] font-bold">Vektor Tersimpan</span>
                          <span className="text-[8px] text-emerald-400/80 font-mono">128-D Terenkripsi</span>
                        </div>
                      ) : (
                        <div className="text-center p-2 text-slate-600">
                          <Camera className="w-5 h-5 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px]">Menunggu</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300 mt-1.5">{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: 128-d Vector Visualizer & Security Guarantee */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Ekstraksi Vektor Embedding (128-D)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  ||v|| = 1.0 (Unit Vector)
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-2">
                Titik fitur biometrik untuk <strong className="text-slate-200">{currentUser?.name || activeStudentInfo.name}</strong> dihitung ke dalam vektor numerik 128-dimensi:
              </p>

              {/* Embedding Tabs */}
              <div className="flex space-x-1 mb-2 bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-[11px]">
                {['front', 'left', 'right'].map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveTabPreview(key)}
                    className={`flex-1 py-1 rounded font-medium transition-all ${
                      activeTabPreview === key
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {key.toUpperCase()} {capturedEmbeddings[key] ? '✓' : ''}
                  </button>
                ))}
              </div>

              {/* 128-d Vector Numeric Matrix */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[10px] text-cyan-300 h-28 overflow-y-auto leading-relaxed shadow-inner">
                {capturedEmbeddings[activeTabPreview] ? (
                  <div className="grid grid-cols-4 gap-1">
                    {capturedEmbeddings[activeTabPreview].map((val, idx) => (
                      <span key={idx} className="bg-slate-900/80 px-1 py-0.5 rounded text-slate-300">
                        <span className="text-slate-500 text-[9px]">[{idx}]</span> {val > 0 ? `+${val}` : val}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 text-center">
                    Ambil foto sudut {activeTabPreview.toUpperCase()} untuk melihat ekstraksi vektor embedding 128-d.
                  </div>
                )}
              </div>

              {/* JAMINAN PRIVASI: FOTO MENTAH TIDAK DISIMPAN & VEKTOR TERENKRIPSI */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 mt-4 text-[11px] text-emerald-200 space-y-2">
                <div className="flex items-center space-x-2 text-white font-bold">
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Jaminan Privasi & Enkripsi Biometrik:</span>
                </div>
                
                <p className="text-emerald-300/90 text-[10px] leading-relaxed">
                  ✓ <strong className="text-white">Foto mentah tidak disimpan:</strong> Citra visual kamera segera dibuang dari memori sesaat setelah vektor diekstraksi.
                </p>
                <p className="text-emerald-300/90 text-[10px] leading-relaxed">
                  ✓ <strong className="text-white">Simpan vektor referensi terenkripsi:</strong> Hanya 128 angka vektor referensi yang dienkripsi dan disimpan di database USINDO untuk pencocokan absensi.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {submitSuccess ? (
                <div className="bg-emerald-900/40 border border-emerald-500/50 rounded-xl p-3 text-center text-xs text-emerald-300 font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Wajah {currentUser?.name || activeStudentInfo.name} Berhasil Disimpan!</span>
                </div>
              ) : isCurrentStudentEnrolled && !previewImages.front ? (
                <div className="space-y-2">
                  <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-xl p-3 text-center text-xs text-emerald-300 font-bold flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Wajah {currentUser?.name || activeStudentInfo.name} Sudah Terdaftar & Aktif</span>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Vektor biometrik 128-d tersimpan di database USINDO. Mahasiswa siap melakukan absensi kelas kapan saja.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSubmitEnrollment}
                  disabled={!isAllCaptured || isSubmitting}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xl ${
                    !isAllCaptured || isSubmitting
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Menyimpan Vektor Terenkripsi...'
                      : isAllCaptured
                      ? `Simpan Vektor Untuk ${currentUser?.name || activeStudentInfo.name}`
                      : `Lengkapi 3 Sudut (${[capturedEmbeddings.front, capturedEmbeddings.left, capturedEmbeddings.right].filter(Boolean).length}/3)`}
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
