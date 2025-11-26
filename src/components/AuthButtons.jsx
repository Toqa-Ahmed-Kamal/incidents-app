import React from "react";
import { auth, googleProvider, githubProvider, signInWithPopup } from "../firebase";


export default function AuthButtons() {
const loginWith = async (provider) => {
try {
await signInWithPopup(auth, provider);
} catch (e) {
console.error(e);
alert("Social login failed");
}
};


return (
<div className="d-grid gap-2">
<button className="btn btn-dark" onClick={() => loginWith(githubProvider)}>
Continue with GitHub
</button>
<button className="btn btn-primary" onClick={() => loginWith(googleProvider)}>
Continue with Google
</button>
</div>
);
}