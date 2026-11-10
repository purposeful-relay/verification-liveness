// Safe client initialization that prevents duplicate declaration errors
if (typeof window.supabaseClient === 'undefined') {
  const SUPABASE_URL = 'https://wpnqqeqdcdsrzxauyhhl.supabase.co';     // Paste your Supabase URL here
  const SUPABASE_ANON_KEY = 'sb_publishable_2zvaRMiJ2feMmSiF7wH__Q_STq3W9V7'; // Paste your Supabase Anon Key here
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
var supabase = window.supabaseClient;

var currentRef = '';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const referenceId = urlParams.get('ref');
  currentRef = referenceId;

  const statusMsg = document.getElementById('status-message');
  const cameraSection = document.getElementById('camera-section');

  if (!currentRef) {
    statusMsg.innerText = 'Error: Missing verification reference session.';
    statusMsg.style.color = 'red';
    return;
  }

  // Check Supabase to confirm this reference exists in your database
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('reference_number', currentRef);

  if (error || !data || data.length === 0) {
    statusMsg.innerText = 'Error: Invalid or expired verification session.';
    statusMsg.style.color = 'red';
    return;
  }

  // Session is valid! Reveal camera and start webcam
  statusMsg.innerText = 'Session validated. Please complete the face scan below.';
  cameraSection.style.display = 'block';
  
  startWebcam();
});

// Turn on the device camera
async function startWebcam() {
  const videoElement = document.getElementById('webcam-stream');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
  } catch (err) {
    console.error('Camera access error:', err);
    alert('Please allow camera permissions in your browser settings to proceed.');
  }
}

// Finalize when user clicks complete
async function completeVerification() {
  const cameraSection = document.getElementById('camera-section');
  const successSection = document.getElementById('success-section');

  const { error } = await supabase
    .from('verifications')
    .update({ status: 'Verified' })
    .eq('reference_number', currentRef);

  if (error) {
    alert('Error updating status in database. Please try again.');
    return;
  }

  const videoElement = document.getElementById('webcam-stream');
  const stream = videoElement.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  cameraSection.style.display = 'none';
  successSection.style.display = 'block';
}