'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile({ id: uid, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const register = async (email, password, displayName, role = 'student') => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName });

      const userDoc = {
        uid: newUser.uid,
        email,
        displayName,
        role,
        avatar: '',
        bio: '',
        enrolledCourses: [],
        createdCourses: [],
        certificates: [],
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          coursesCompleted: 0,
          totalHours: 0,
          certificates: 0,
        },
        notifications: {
          email: true,
          push: true,
        },
      };

      await setDoc(doc(db, 'users', newUser.uid), userDoc);
      setUserProfile({ id: newUser.uid, ...userDoc });

      // Log activity
      await logActivity(newUser.uid, 'register', { role });

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(loggedUser.uid);
      await logActivity(loggedUser.uid, 'login', {});
      return { success: true, user: loggedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { user: googleUser } = await signInWithPopup(auth, googleProvider);
      const docRef = doc(db, 'users', googleUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const userDoc = {
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName,
          role: 'student',
          avatar: googleUser.photoURL || '',
          bio: '',
          enrolledCourses: [],
          createdCourses: [],
          certificates: [],
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          stats: { coursesCompleted: 0, totalHours: 0, certificates: 0 },
          notifications: { email: true, push: true },
        };
        await setDoc(docRef, userDoc);
        setUserProfile({ id: googleUser.uid, ...userDoc });
      } else {
        setUserProfile({ id: googleUser.uid, ...docSnap.data() });
      }

      await logActivity(googleUser.uid, 'login_google', {});
      return { success: true, user: googleUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      if (user) await logActivity(user.uid, 'logout', {});
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logActivity = async (userId, action, data) => {
    try {
      const activityRef = doc(db, 'activities', `${userId}_${Date.now()}`);
      await setDoc(activityRef, {
        userId,
        action,
        data,
        timestamp: serverTimestamp(),
        ip: '',
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const refreshProfile = () => {
    if (user) fetchUserProfile(user.uid);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isTeacher = userProfile?.role === 'teacher' || isAdmin;
  const isStudent = userProfile?.role === 'student';

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      refreshProfile,
      isAdmin,
      isTeacher,
      isStudent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
