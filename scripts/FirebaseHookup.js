var firebaseConfig = {
    apiKey: 'AIzaSyDv4cj6mEpAJsfU50qOHB9E8n0q0L6yAV0',
    authDomain: 'contact-tracing-pausd.firebaseapp.com',
    projectId: 'contact-tracing-pausd',
    storageBucket: 'contact-tracing-pausd.appspot.com',
    messagingSenderId: '611686150385',
    appId: '1:611686150385:web:a1446ad40520a1c97cf950',
    measurementId: 'G-JEHK3TEKE1',
};
// Initialize Firebase
var fb = firebase.initializeApp(firebaseConfig),
    analytics = firebase.analytics(),
    db = firebase.firestore();

var currentTeacherInfo = {};

function saveLayout(teacherId, layoutId, layout) {
    db.collection(teacherId)
        .doc(layoutId)
        .set({ desks: layout })
        .then(() => {
            window.alert('Success!');
        })
        .catch((error) => {
            window.alert('Uh Oh!\nSomething went wrong');
            console.error('Error writing document:', error);
        });
}

function getTeacherInfo(teacherId, supressSuccess = false) {
    db.collection(teacherId)
        .get()
        .then((querySnapshot) => {
            currentTeacherInfo = {};
            querySnapshot.forEach((doc) => {
                currentTeacherInfo[doc.id] = doc.data();
            });
            if (!supressSuccess) {
                if (Object.keys(currentTeacherInfo).length == 0) {
                    window.alert('No Data!');
                } else {
                    window.alert('Success!');
                }
            }
            updateMenu('layouts');
        })
        .catch((err) => {
            window.alert('Incorrect Teacher ID');
            console.error('Error fetching document:', err);
        });
}
