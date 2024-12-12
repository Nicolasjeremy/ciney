const firebaseConfig = {
    apiKey: "AIzaSyBvxIhShPjtwS1NsO87dm3CFH4x8gBds_Q",
    authDomain: "ciney-f371f.firebaseapp.com",
    projectId: "ciney-f371f",
    storageBucket: "ciney-f371f.appspot.com",
    messagingSenderId: "1064556690023",
    appId: "1:1064556690023:web:0a1f52e1042f5129a1f2c2",
    measurementId: "G-02H92XFJJH"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const videoPlaceholders = document.querySelectorAll('.video-placeholder');
const overlay = document.getElementById('overlay');
const videoPlayer = document.getElementById('video-player');
const commentSection = document.getElementById('comment-section');
const commentInput = document.getElementById('comment-input');

videoPlaceholders.forEach(video => {
    video.addEventListener('click', async () => {
        const videoUrl = video.getAttribute('data-video');
        const videoId = new URL(videoUrl).pathname.split('/').pop();
        videoPlayer.src = videoUrl;
        overlay.style.display = 'flex';

        db.collection('comments')
            .where('videoId', '==', videoId)
            .orderBy('timestamp')
            .onSnapshot(snapshot => {
                commentSection.innerHTML = '';
                snapshot.forEach(doc => {
                    const commentData = doc.data();
                    const newComment = document.createElement('div');
                    newComment.className = 'comment';
                    newComment.textContent = `${commentData.username || 'Anonymous'}: ${commentData.comment}`;
                    commentSection.appendChild(newComment);
                });
            });
    });
});

commentInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && commentInput.value.trim() !== '') {
        const commentText = commentInput.value.trim();
        const videoId = new URL(videoPlayer.src).pathname.split('/').pop();
        const user = auth.currentUser;

        if (user) {
            await db.collection('comments').add({
                videoId: videoId,
                comment: commentText,
                userId: user.uid,
                username: user.displayName || 'Anonymous',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            commentInput.value = '';
        } else {
            alert("Please log in to comment.");
        }
    }
});

function closeOverlay() {
    overlay.style.display = 'none';
    videoPlayer.src = '';
    commentSection.innerHTML = '';
}
