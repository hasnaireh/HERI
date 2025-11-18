import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// Settings
export const getSettings = async () => {
  const docRef = doc(db, 'settings', 'main');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateSettings = async (data) => {
  const docRef = doc(db, 'settings', 'main');
  return await updateDoc(docRef, data);
};

// Social Links
export const getSocialLinks = async () => {
  const q = query(collection(db, 'socialLinks'), orderBy('order'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addSocialLink = async (data) => {
  const docRef = doc(collection(db, 'socialLinks'));
  return await setDoc(docRef, data);
};

export const updateSocialLink = async (id, data) => {
  const docRef = doc(db, 'socialLinks', id);
  return await updateDoc(docRef, data);
};

export const deleteSocialLink = async (id) => {
  const docRef = doc(db, 'socialLinks', id);
  return await deleteDoc(docRef);
};

// Promo Links
export const getPromoLinks = async () => {
  const q = query(collection(db, 'promoLinks'), orderBy('order'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addPromoLink = async (data) => {
  const docRef = doc(collection(db, 'promoLinks'));
  return await setDoc(docRef, data);
};

export const updatePromoLink = async (id, data) => {
  const docRef = doc(db, 'promoLinks', id);
  return await updateDoc(docRef, data);
};

export const deletePromoLink = async (id) => {
  const docRef = doc(db, 'promoLinks', id);
  return await deleteDoc(docRef);
};

// Portfolio Items
export const getPortfolioItems = async () => {
  const q = query(collection(db, 'portfolioItems'), orderBy('order'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addPortfolioItem = async (data) => {
  const docRef = doc(collection(db, 'portfolioItems'));
  return await setDoc(docRef, data);
};

export const updatePortfolioItem = async (id, data) => {
  const docRef = doc(db, 'portfolioItems', id);
  return await updateDoc(docRef, data);
};

export const deletePortfolioItem = async (id) => {
  const docRef = doc(db, 'portfolioItems', id);
  return await deleteDoc(docRef);
};

// Link Cache
export const getCachedLink = async (url) => {
  const docRef = doc(db, 'linkCache', btoa(url));
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Check if cache is still valid (24 hours)
    const now = Date.now();
    if (now - data.timestamp < 24 * 60 * 60 * 1000) {
      return data;
    }
  }
  return null;
};

export const cacheLink = async (url, metadata) => {
  const docRef = doc(db, 'linkCache', btoa(url));
  return await setDoc(docRef, {
    url,
    ...metadata,
    timestamp: Date.now()
  });
};