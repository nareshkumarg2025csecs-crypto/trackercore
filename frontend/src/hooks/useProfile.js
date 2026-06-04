import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";

export const useProfile = (uid, showToast) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", uid, "profile", "data");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          // Initialize empty profile
          const defaultProfile = {
            username: "",
            photoURL: "",
            role: "",
            ageRange: "",
            incomeRange: "",
            primarySpending: "",
            savingsGoal: "",
            financialHabit: ""
          };
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (showToast) showToast("Failed to load profile data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  const updateProfile = async (newData) => {
    if (!uid) return;
    try {
      const docRef = doc(db, "users", uid, "profile", "data");
      // Use setDoc with merge to create if it doesn't exist
      await setDoc(docRef, newData, { merge: true });
      setProfile((prev) => ({ ...prev, ...newData }));
      if (showToast) showToast("Profile updated successfully", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (showToast) showToast("Failed to update profile", "error");
      throw error;
    }
  };

  const uploadAvatar = (file) => {
    return new Promise((resolve, reject) => {
      if (!uid || !file) {
        reject(new Error("Missing uid or file"));
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      const storageRef = ref(storage, `profile-images/${uid}/avatar.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading avatar:", error);
          if (showToast) showToast("Failed to upload image", "error");
          setUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile({ photoURL: downloadURL });
            
            // Save URL to users/{uid} Firestore document as requested
            await setDoc(doc(db, "users", uid), {
              photoURL: downloadURL
            }, { merge: true });

            setUploading(false);
            setUploadProgress(0);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL or updating firestore:", error);
            setUploading(false);
            reject(error);
          }
        }
      );
    });
  };

  return {
    profile,
    loading,
    uploading,
    uploadProgress,
    updateProfile,
    uploadAvatar,
  };
};
