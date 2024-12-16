
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

const ui = new firebaseui.auth.AuthUI(auth);

ui.start("#firebaseui-auth-container", {
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    signInFlow: "popup",
    signInSuccessUrl: "/frontend/home.html",
    callbacks: {
        uiShown: () => {
            document.getElementById("loader").style.display = "none";
        },
    },
});

function showWelcomeMessage(user) {
    const container = document.getElementById("firebaseui-auth-container");
    container.style.display = "none";

    const loader = document.getElementById("loader");
    loader.style.display = "block";
    loader.innerHTML = `
      <h2>Hello, ${user.displayName || user.email}!</h2>
      <button id="continue-button" class="continue-button">Continue</button>
    `;

    document.getElementById("continue-button").addEventListener("click", () => {
        window.location.href = "/frontend/home.html";
    });
}

document.getElementById("logout")?.addEventListener("click", () => {
    auth.signOut()
        .then(() => {
            console.log("User signed out.");
            window.location.href = "/";
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
});

if (user) {
    console.log("User ID:", user.uid);
    db.collection("users").doc(user.uid).get().then(doc => {
        console.log("isAdmin:", doc.exists ? doc.data().isAdmin : "No data found");
    });
}