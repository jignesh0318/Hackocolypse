# 📱 PWA Installation Guide - Safety Zones App

## What is a PWA?
A Progressive Web App (PWA) is a web application that works like a native app on your phone. You can install it on your home screen and use it just like any app from the Play Store or App Store.

---

## ✨ Installation Instructions

### **On Android Devices:**

#### Method 1: Using Chrome (Recommended)
1. **Open Chrome** and go to: `https://jignesh0318.github.io/Hackocolypse/` (or your deployed URL)
2. **Wait for the install prompt** - A popup should appear at the bottom saying "Install Safety Zones"
3. **Tap "Install"** button
4. **Confirm installation** - The app will be added to your home screen
5. **Done!** 🎉 You can now use Safety Zones like a regular app

#### Method 2: Manual Installation
1. **Open Chrome** and go to your app URL
2. **Tap the three-dot menu** (⋮) in the top right
3. **Select "Install app"** or **"Add to Home screen"**
4. **Tap "Install"** to confirm
5. **Your app is ready!** 📱

#### Method 3: From Settings
1. **Open Chrome** and go to your app
2. **Tap the three-dot menu** (⋮)
3. **Select "Settings"** → **"Apps"**
4. **Tap "Install app"**
5. **Confirm the installation**

### **On iOS (iPhone/iPad):**

1. **Open Safari** (PWAs work best in Safari on iOS)
2. **Go to** your app URL
3. **Tap the Share button** (box with arrow) at the bottom
4. **Scroll down and tap "Add to Home Screen"**
5. **Enter a name** (e.g., "Safety Zones")
6. **Tap "Add"**
7. **Your app is installed!** ✅ Look for it on your home screen

---

## 🚀 Using the App

### First Launch
- When you open the app, you'll see an **install prompt** (if not already installed)
- Your **safety profile** will guide you through emergency contact setup
- The app will **start tracking your route** automatically

### Key Features

#### 🔴 Emergency SOS
- **One-tap** emergency alert
- **Buzzer sound** plays for 5 seconds so you can cancel if accidental
- **Automatically sends** your location and route to emergency contacts
- **Works even offline** (syncs when connection returns)

#### 📍 Route Tracking
- **Continuous GPS tracking** of your path
- **Battery monitoring** - sends emergency data if battery drops below 5%
- **View your route** anytime on Google Maps
- **Track distance traveled** and time

#### 🔋 Battery Status
- **Real-time battery percentage** displayed
- **Warning indicators** at 10% and critical at 5%
- **Automatic emergency alert** when critically low

#### 📞 Emergency Contacts
- **Add up to 2 emergency contacts** in your safety profile
- **Include phone numbers and relationships**
- **Include medical info** (blood type, allergies, medications)

---

## 🔌 Offline Functionality

The app works **completely offline**:
- ✅ View your dashboard
- ✅ Access your route history
- ✅ Trigger SOS (syncs when online)
- ✅ View maps (cached)
- ✅ Check battery status
- ⚠️ Emergency contacts require internet to send alerts

---

## 🔋 Battery Monitoring

### How It Works:
1. App monitors your device battery continuously
2. At **≤ 10%**: Yellow warning indicator shows
3. At **≤ 5%**: Red critical indicator shows
4. **Automatic emergency alert** sends:
   - Your last known location
   - Your entire travel route
   - Distance traveled and duration
   - Your medical information
   - All to your emergency contacts

### Note:
The Battery Status API has limited support on iOS. On iPhone, you should manually trigger SOS if battery is very low.

---

## 📲 Notifications

### Push Notifications
The app can send **push notifications** for:
- ⚠️ Safety alerts in your area
- 🚨 SOS confirmations
- 🔔 Important updates

**To enable notifications:**
1. When prompted by the app, tap **"Allow"**
2. Or go to **Settings** → **Notifications** → **Safety Zones** → **Allow**

---

## 🛠️ Troubleshooting

### "Install prompt not showing?"
- **Clear browser cache**: Settings → Apps → Chrome → Storage → Clear Cache
- **Ensure HTTPS**: The app must be served over HTTPS for PWA to work
- **Check Android version**: Android 5.0+ required
- **Try a different browser**: Try Chrome, Microsoft Edge, or Samsung Internet

### "App won't work offline?"
- **Check Service Worker**: Settings → Apps → Chrome → Permissions → check all are allowed
- **Refresh the page**: Sometimes service worker needs reinstallation
- **Clear app data**: Settings → Apps → Safety Zones → Storage → Clear Data

### "Route tracking not working?"
- **Enable location services**: Settings → Location → Turn ON
- **Allow app permission**: Settings → Apps → Safety Zones → Permissions → Location → Allow
- **Check accuracy**: High accuracy mode gives better results

### "Battery API not available?"
- Battery Status API is **not available on iOS**
- On **Android**: Ensure you're using Chrome or compatible browser
- On **older Android**: Some devices don't support this API

---

## 📊 How Your Data is Used

### Stored Locally
- Route history and GPS points
- Emergency contact information
- Your profile and preferences
- Battery status and logs

**All stored in your device** - No data sent to servers without your action

### Sent to Emergency Contacts
- When you trigger SOS manually
- When battery critically low (auto-alert)
- **Only**: Location, route, distance, medical info, your contact details

---

## 🔒 Privacy & Security

✅ **End-to-end**: Your data stays on your device until an emergency
✅ **No tracking**: We don't track you between emergencies
✅ **Offline-first**: Works without internet
✅ **Open source**: Code is transparent and auditable
✅ **No ads**: No advertising or data selling

---

## 📱 Device Support

### ✅ Supported
- **Android 5.0+** (Chrome, Firefox, Samsung Internet)
- **iOS 12.2+** (Safari - as web app, not native)
- **Windows/Mac** (As desktop PWA)

### ⚠️ Limited Support
- **Older Android versions**: Battery API might not work
- **iOS**: Background tracking limited by iOS restrictions

---

## 🔄 Updates

PWA apps **update automatically** when you reload them:
1. New features appear immediately
2. No app store wait times
3. Automatic bug fixes

**To force update**: Settings → Apps → Safety Zones → Clear Cache & Data, then reopen

---

## 📞 Support

For issues or feature requests:
- **GitHub Issues**: https://github.com/jignesh0318/Hackocolypse/issues
- **Contact**: Your emergency contacts setup in the app

---

## 🎯 Quick Start Checklist

- [ ] Install the app from home screen
- [ ] Open app and complete safety profile
- [ ] Add emergency contacts and medical info
- [ ] Enable location permissions
- [ ] Enable notifications
- [ ] Test route tracking (open location permission)
- [ ] Check battery indicator in dashboard
- [ ] Familiarize yourself with SOS button
- [ ] Share app with friends for mutual safety

---

## 💡 Tips for Best Experience

1. **Keep location ON** - Required for route tracking
2. **Allow notifications** - Get important safety alerts
3. **Check permissions regularly** - Permissions may reset after updates
4. **Review emergency contacts** - Keep them up to date
5. **Test SOS when safe** - Familiarize yourself with the interface
6. **Share with friends** - Build a safety network
7. **Enable auto-brightness** - Helps with long-term battery life

---

**Your safety is our priority. Stay safe! 🛡️**
