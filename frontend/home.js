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

// Wait for user authentication state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User ID:", user.uid);
        try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            console.log("isAdmin:", userDoc.exists ? userDoc.data().isAdmin : "No data found");
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        console.log("No user is logged in.");
    }
});

// Render comments and check for admin role during rendering
async function renderComments(videoId) {
    const user = auth.currentUser;

    if (!user) return; // If user is not authenticated, do nothing

    // Fetch the admin status for the current user
    const userDoc = await db.collection('users').doc(user.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().isAdmin === true;

    // Fetch and render comments
    db.collection('comments')
        .where('videoId', '==', videoId)
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            commentSection.innerHTML = ''; // Clear existing comments

            snapshot.forEach(docSnapshot => {
                const commentData = docSnapshot.data();
                const commentId = docSnapshot.id;

                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';
                commentDiv.innerHTML = `
                    <span class="username">${commentData.username || 'Anonymous'}:</span>
                    <span class="text">${commentData.comment}</span>
                `;

                // Add delete button only if the current user is an admin
                if (isAdmin) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.addEventListener('click', () => deleteComment(commentId));
                    commentDiv.appendChild(deleteBtn);
                }

                commentSection.appendChild(commentDiv);
            });
        });
}

// Function to delete a comment
async function deleteComment(commentId) {
    if (confirm("Are you sure you want to delete this comment?")) {
        try {
            await db.collection('comments').doc(commentId).delete();
            alert("Comment deleted successfully.");
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Failed to delete the comment.");
        }
    }
}

// Handle video click to load comments
videoPlaceholders.forEach(video => {
    video.addEventListener('click', () => {
        const videoUrl = video.getAttribute('data-video');
        const videoId = new URL(videoUrl).pathname.split('/').pop();
        videoPlayer.src = videoUrl;
        overlay.style.display = 'flex';

        renderComments(videoId); // Fetch comments for this video
    });
});

// Handle adding a new comment
commentInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && commentInput.value.trim() !== '') {
        const commentText = commentInput.value.trim();
        const videoId = new URL(videoPlayer.src).pathname.split('/').pop();
        const user = auth.currentUser;

        if (user) {
            await db.collection('comments').add({
                videoId: videoId,
                comment: commentText,
                userId: user.uid, // Store user ID
                username: user.displayName || 'Anonymous',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            commentInput.value = '';
        } else {
            alert("Please log in to comment.");
        }
    }
});

// Close video overlay
function closeOverlay() {
    overlay.style.display = 'none';
    videoPlayer.src = '';
    commentSection.innerHTML = '';
}
