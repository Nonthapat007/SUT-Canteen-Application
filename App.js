import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { COLORS } from './src/constants/colors';
import { store } from './src/services/store';
import authService from './src/services/authService';
import supabase from './src/services/supabase';
import { sanitizeAvatarUri } from './src/utils/imageUtils';

// Auth Screens (Images 1 & 2)
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';

// Main Consumer App Screens (Image 3)
import HomeScreen from './src/screens/consumer/HomeScreen';
import SearchScreen from './src/screens/consumer/SearchScreen';
import OrderTrackingView from './src/screens/consumer/OrderTrackingView';
import ProfileScreen from './src/screens/consumer/ProfileScreen';

// Vendor Merchant App (Reference Images 1-4: คิว, เมนู, สรุป, โปรไฟล์)
import MerchantApp from './src/screens/merchant/MerchantApp';

// Bottom Navigation Bar
import BottomNavBar from './src/components/BottomNavBar';

export default function App() {
  const { width } = useWindowDimensions();
  const isMobileScreen = width < 500 || Platform.OS !== 'web';

  const [state, setState] = useState(store.getState());

  // Auth state: starts logged out by default unless Remember Me was enabled!
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('signin'); // 'signin' | 'signup'
  const [currentUser, setCurrentUser] = useState(null);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  // Main active tab for consumer: 'home' | 'search' | 'orders' | 'profile'
  const [activeTab, setActiveTab] = useState('home');
  const [highlightWallet, setHighlightWallet] = useState(false);

  const handleRequireTopUp = () => {
    setHighlightWallet(true);
    setActiveTab('profile');
  };

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Restore remembered session on app launch ONLY if "Remember Me" was previously selected
  useEffect(() => {
    const checkSavedSession = async () => {
      try {
        const saved = await authService.getSavedSession();

        // If no saved session or user did NOT check Remember Me, stay on Login screen
        if (!saved || !saved.role || !saved.rememberMe) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          try {
            await supabase.auth.signOut();
          } catch (e) { }
          return;
        }

        let sessionUser = { ...saved };

        // Check for latest profile updates from Cloud
        try {
          const fresh = await authService.fetchLatestUserProfile(saved);
          if (fresh) {
            sessionUser = fresh;
          }
        } catch (syncErr) {
          console.warn('Supabase profile sync notice:', syncErr);
        }

        sessionUser.avatarUri = sanitizeAvatarUri(sessionUser.avatarUri);

        setCurrentUser(sessionUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.warn('Failed to restore saved session:', err);
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };
    checkSavedSession();
  }, []);

  // When user switches to profile tab, auto-sync profile from Supabase to keep all devices linked
  useEffect(() => {
    if (activeTab === 'profile' && currentUser && typeof authService.fetchLatestUserProfile === 'function') {
      authService
        .fetchLatestUserProfile(currentUser)
        .then((fresh) => {
          if (
            fresh &&
            (fresh.avatarUri !== currentUser.avatarUri ||
              fresh.fullName !== currentUser.fullName ||
              fresh.phoneNumber !== currentUser.phoneNumber ||
              fresh.roleTitle !== currentUser.roleTitle)
          ) {
            setCurrentUser(fresh);
          }
        })
        .catch((e) => {
          console.warn('Profile sync notice:', e);
        });
    }
  }, [activeTab]);

  // Filter consumer orders specific to currentUser (so newly registered users start with an empty screen)
  const userOrders = (state.orders || []).filter((o) => {
    if (!currentUser) return false;
    if (o.userEmail && currentUser.email) {
      return o.userEmail.toLowerCase() === currentUser.email.toLowerCase();
    }
    if (o.studentPhone && currentUser.phoneNumber) {
      return o.studentPhone === currentUser.phoneNumber;
    }
    if (o.studentName && currentUser.fullName) {
      return o.studentName === currentUser.fullName;
    }
    return false;
  });

  // Filter active orders that need tracking for badge count
  const activeOrders = userOrders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  // Store actions wrapper
  const storeActions = {
    setRole: (role) => store.setRole(role),
    setBuilding: (building) => store.setBuilding(building),
    setSelectedCanteen: (canteen) => store.setSelectedCanteen(canteen),
    setSelectedVendorStall: (stallId) => store.setSelectedVendorStall(stallId),
    createPredictiveOrder: (params) => store.createPredictiveOrder(params),
    createGrabAndGoOrder: (item, qty, currentUser) => store.createGrabAndGoOrder(item, qty, currentUser),
    updateOrderStatus: (orderId, newStatus) => store.updateOrderStatus(orderId, newStatus),
    updateGrabStock: (itemId, delta) => store.updateGrabStock(itemId, delta),
    topUpWallet: (amount) => store.topUpWallet(amount),
    reloadStalls: () => store.reloadStalls(),
    updateStallImage: (stallId, imageUrl) => store.updateStallImage(stallId, imageUrl),
    releaseOrderNow: (orderId) => store.releaseOrderNow(orderId),
  };

  // Auth Handlers
  const handleSignInSuccess = async (userData, rememberMe = false) => {
    const cleanUser = {
      ...userData,
      avatarUri: sanitizeAvatarUri(userData?.avatarUri),
    };

    setCurrentUser(cleanUser);
    setIsAuthenticated(true);

    if (rememberMe) {
      await authService.saveSession(cleanUser);
    } else {
      await authService.clearSession();
    }

    if (cleanUser.role !== 'merchant') {
      setActiveTab('home');
    }
  };

  const handleSignUpSuccess = (userData) => {
    // After signing up, navigate to sign in screen so user logs in with their credentials!
    setPrefilledEmail(userData.email || '');
    setAuthView('signin');
    Alert.alert(
      'สมัครสมาชิกสำเร็จ!',
      `ยินดีต้อนรับคุณ ${userData.fullName}\nกรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบ`
    );
  };

  const handleLogout = async () => {
    try {
      await authService.clearSession();
      await supabase.auth.signOut();
    } catch (e) { }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthView('signin');
    setActiveTab('home');
  };

  const handleUpdateProfile = async (updatedData) => {
    const cleanData = {
      ...updatedData,
      avatarUri: sanitizeAvatarUri(updatedData?.avatarUri),
    };
    const res = await authService.updateUserProfile(currentUser, cleanData);
    if (res?.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const handleRefreshProfile = async () => {
    if (!currentUser) return null;
    const fresh = await authService.fetchLatestUserProfile(currentUser);
    if (fresh) {
      setCurrentUser(fresh);
    }
    return fresh;
  };

  const isMerchant = currentUser?.role === 'merchant';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        isMobileScreen ? styles.safeAreaMobile : styles.safeAreaDesktop,
      ]}
    >
      <ExpoStatusBar style="dark" />
      <View
        style={[
          styles.mobileFrame,
          isMobileScreen ? styles.mobileFrameNative : styles.mobileFrameDesktop,
        ]}
      >
        {/* If Not Authenticated: Show Sign In or Sign Up */}
        {!isAuthenticated ? (
          authView === 'signin' ? (
            <SignInScreen
              initialEmail={prefilledEmail}
              onSignInSuccess={handleSignInSuccess}
              onNavigateToSignUp={() => setAuthView('signup')}
            />
          ) : (
            <SignUpScreen
              onSignUpSuccess={handleSignUpSuccess}
              onNavigateToSignIn={() => setAuthView('signin')}
            />
          )
        ) : isMerchant ? (
          /* Strictly Merchant Interface - No customer access */
          <View style={styles.appBody}>
            <MerchantApp
              storeState={state}
              storeActions={storeActions}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </View>
        ) : (
          /* Strictly Consumer Interface - No merchant KDS access */
          <View style={styles.appBody}>
            {activeTab === 'home' && (
              <HomeScreen
                storeState={state}
                storeActions={storeActions}
                currentUser={currentUser}
                onOpenSearch={() => setActiveTab('search')}
                onNavigateTracking={() => setActiveTab('orders')}
                onRequireTopUp={handleRequireTopUp}
                onOpenProfile={() => setActiveTab('profile')}
              />
            )}

            {activeTab === 'search' && (
              <SearchScreen
                stalls={state.stalls || []}
                onSelectStall={(stall) => {
                  storeActions.setSelectedCanteen(state.selectedCanteen);
                  setActiveTab('home');
                }}
              />
            )}

            {activeTab === 'orders' && (
              <OrderTrackingView
                orders={userOrders}
                currentUser={currentUser}
                rewardsPoints={state.rewardsPoints || 0}
                walletBalance={state.walletBalance || 0}
                onNavigateHome={() => setActiveTab('home')}
                onCompletePickup={(orderId) => storeActions.updateOrderStatus(orderId, 'COMPLETED')}
                onReleaseOrderNow={(orderId) => storeActions.releaseOrderNow(orderId)}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                currentUser={currentUser}
                currentBuilding={state.currentBuilding}
                walletBalance={state.walletBalance}
                rewardsPoints={state.rewardsPoints}
                highlightWallet={highlightWallet}
                onResetHighlight={() => setHighlightWallet(false)}
                onSelectBuilding={storeActions.setBuilding}
                onTopUpWallet={storeActions.topUpWallet}
                onNavigateOrders={() => setActiveTab('orders')}
                onNavigateSearch={() => setActiveTab('search')}
                onUpdateProfile={handleUpdateProfile}
                onRefreshProfile={handleRefreshProfile}
                onLogout={handleLogout}
              />
            )}

            {/* Bottom Navigation Bar (Shown strictly on consumer tabs) */}
            <BottomNavBar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              ordersCount={activeOrders.length}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeAreaMobile: {
    backgroundColor: COLORS.surface,
  },
  safeAreaDesktop: {
    backgroundColor: '#EEF2F6',
  },
  mobileFrame: {
    flex: 1,
    backgroundColor: COLORS.surface,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  mobileFrameNative: {
    width: '100%',
    maxWidth: '100%',
    borderRadius: 0,
  },
  mobileFrameDesktop: {
    maxWidth: 440,
    width: '100%',
    marginVertical: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  appBody: {
    flex: 1,
  },
});
