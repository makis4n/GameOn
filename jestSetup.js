jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Firebase App mock
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: false,
  })),
  registerVersion: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn(() => []),
  deleteApp: jest.fn(),
}));

// Firebase Auth mock
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({
    currentUser: null,
    languageCode: 'en',
    settings: {},
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
      }
    })),
    signOut: jest.fn(() => Promise.resolve()),
    createUserWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    confirmPasswordReset: jest.fn(),
    verifyPasswordResetCode: jest.fn(),
    applyActionCode: jest.fn(),
    checkActionCode: jest.fn(),
    updatePassword: jest.fn(),
    updateEmail: jest.fn(),
    sendEmailVerification: jest.fn(),
  })),
  getReactNativePersistence: jest.fn(() => ({
    type: 'persistence',
    async setItem() {},
    async getItem() {},
    async removeItem() {},
  })),
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// Firestore mock
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({
    _listeners: {},
    collection: jest.fn(),
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: jest.fn(() => true),
        data: jest.fn(() => ({})),
        id: 'test-doc',
      })),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      onSnapshot: jest.fn(),
    })),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    endBefore: jest.fn(),
  })),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
    setParams: jest.fn(),
  },
}));

// Mock alerts
global.alert = jest.fn();