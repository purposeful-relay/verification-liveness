// 1. Initialize Supabase (Ensure you input your actual project keys)
const SUPABASE_URL = 'https://wpnqqeqdcdsrzxauyhhl.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_2zvaRMiJ2feMmSiF7wH__Q_STq3W9V7'; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentRef = '';

document.addEventListener('DOMContentLoaded', async () => {
  // 2. Read the reference code passed from the URL (e.g. app.example.com/?ref=12345)
  const urlParams = new URLSearchParams(window.location.search);
  currentRef = urlParams.get('ref');

  const statusMsg = document.getElementById('status-message');
  const cameraSection = document.getElementById('camera-section');

  if (!currentRef) {
    statusMsg.innerText = 'Error: Missing verification reference session.';
    statusMsg.style.color = 'red';
    return;
  }

  // 3. Check Supabase to confirm this reference exists in your database
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('reference_number', currentRef);

  if (error || !data || data.length === 0) {
    statusMsg.innerText = 'Error: Invalid or expired verification session.';
    statusMsg.style.color = 'red';
    return;
  }

  // 4. Session is valid! Reveal the camera section and start webcam
  statusMsg.innerText = 'Session validated. Please complete the face scan below.';
  cameraSection.style.display = 'block';
  
  startWebcam();
});

// 5. Turn on the device camera
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

// 6. Finalize when user clicks complete
async function completeVerification() {
  const cameraSection = document.getElementById('camera-section');
  const successSection = document.getElementById('success-section');

  // Update Supabase status column to "Verified"
  const { error } = await supabase
    .from('verifications')
    .update({ status: 'Verified' })
    .eq('reference_number', currentRef);

  if (error) {
    alert('Error updating status in database. Please try again.');
    return;
  }

  // Turn off camera hardware light
  const videoElement = document.getElementById('webcam-stream');
  const stream = videoElement.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  // Hide camera UI and show success card
  cameraSection.style.display = 'none';
  successSection.style.display = 'block';
}