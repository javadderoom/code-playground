<template>
  <div class="register-page">
    <!-- RIGHT SIDE: VISUALS -->
    <div class="visual-side">
      <div class="code-bg">
        if (player.ready) {<br>
        &nbsp;&nbsp;startJourney();<br>
        }<br><br>
        // Level 1 Loading...<br>
        const skills = [];
      </div>

      <div class="mascot-container">
        <svg class="mascot-img" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#4C1D95" fill-opacity="0.5"/>
          <rect x="60" y="70" width="80" height="60" rx="10" fill="#F8FAFC"/>
          <rect x="70" y="80" width="20" height="20" rx="5" fill="#0F172A"/>
          <rect x="110" y="80" width="20" height="20" rx="5" fill="#0F172A"/>
          <path d="M70 110 Q100 120 130 110" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
          <rect x="85" y="40" width="5" height="30" fill="#F8FAFC"/>
          <circle cx="87.5" cy="35" r="8" fill="#10B981"/>
        </svg>
      </div>

      <div class="visual-text">
        <h2>شروع ماجراجویی کدنویسی</h2>
        <p>به جمع ۵۰,۰۰۰ برنامه‌نویس بپیوندید، با باگ‌ها بجنگید و جایزه بگیرید.</p>
      </div>
    </div>

    <!-- LEFT SIDE: FORM -->
    <div class="form-side">
      <div class="form-container">
        <div class="progress-indicator">
          <span>وضعیت بازیکن</span>
          <div class="progress-bar"><div class="progress-fill"></div></div>
          <span style="direction: ltr;">33%</span>
        </div>

        <h1>ساخت پروفایل جدید</h1>
        <p class="subtitle">حساب خود را بسازید تا XP و نشان‌های خود را ذخیره کنید.</p>

        <form @submit.prevent="handleRegister">
          <!-- CHOOSE PATH -->
          <label class="label">کلاس خود را انتخاب کنید</label>
          <div class="class-selection">
            <div
              v-for="(classOption, index) in classOptions"
              :key="index"
              :class="['class-card', { active: selectedClass === classOption.id }]"
              @click="selectedClass = classOption.id"
            >
              <div v-if="classOption.xpBonus" class="xp-bonus">+{{ classOption.xpBonus }} XP</div>
              <div class="class-icon">
                <i :class="classOption.icon"></i>
              </div>
              <div class="class-name">{{ classOption.name }}</div>
            </div>
          </div>

          <!-- INPUTS -->
          <div class="input-group">
            <label class="label">نام بازیکن (نام کاربری)</label>
            <input
              v-model="form.username"
              type="text"
              class="input-field"
              placeholder="مثلا: CodeMaster"
              required
            >
          </div>

          <div class="input-group">
            <label class="label">آدرس ایمیل</label>
            <input
              v-model="form.email"
              type="email"
              class="input-field input-ltr"
              placeholder="you@example.com"
              required
            >
          </div>

          <div class="input-group">
            <label class="label">رمز عبور</label>
            <input
              v-model="form.password"
              type="password"
              class="input-field input-ltr"
              placeholder="••••••••••••"
              required
            >
          </div>

          <button type="submit" class="btn-start" name="register_btn" :disabled="rootStore.state.isUserLoading">
            <i class="fa-solid fa-play"></i>
            {{ rootStore.state.isUserLoading ? 'در حال ثبت نام...' : 'شروع ماجراجویی' }}
          </button>

          <!-- SOCIAL -->
          <div class="social-divider">
              <span>یا ادامه دهید با</span>
          </div>
          <div class="social-icons">
              <div class="social-btn" @click="loginWithGithub">
                <i class="fa-brands fa-github"></i>
              </div>
              <div class="social-btn" @click="loginWithGoogle">
                <i class="fa-brands fa-google"></i>
              </div>
              <div class="social-btn" @click="loginWithDiscord">
                <i class="fa-brands fa-discord"></i>
              </div>
            </div>

          <p class="login-link">
            قبلاً سیو فایل دارید؟ <NuxtLink to="/login">ادامه بازی (ورود)</NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rootStore = useRootStore()
const selectedClass = ref('frontend')

const form = ref({
  username: '',
  email: '',
  password: ''
})

const classOptions = [
  {
    id: 'frontend',
    name: 'فرانت‌اند',
    icon: 'fa-solid fa-laptop-code',
    xpBonus: 50
  },
  {
    id: 'backend',
    name: 'بک‌اند',
    icon: 'fa-solid fa-database'
  },
  {
    id: 'gamedev',
    name: 'بازی‌سازی',
    icon: 'fa-solid fa-gamepad'
  }
]

const handleRegister = async () => {
  if (rootStore.state.isUserLoading) return

  try {
    await rootStore.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    })

    // Registration successful - redirect to login or dashboard
    await navigateTo('/login')

  } catch (error) {
    // Error is handled by the store
    console.error('Registration failed:', error)
  }
}

const loginWithGithub = () => {
  // TODO: Implement GitHub OAuth
  console.log('GitHub login')
}

const loginWithGoogle = () => {
  // TODO: Implement Google OAuth
  console.log('Google login')
}

const loginWithDiscord = () => {
  // TODO: Implement Discord OAuth
  console.log('Discord login')
}
</script>

<style scoped>

.register-page {
  margin: 0;
  padding: 0;
  font-family: 'Vazirmatn', sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  height: 100vh;
  display: flex;
  overflow: hidden;
  direction: rtl;
  height: 100vh;
  overflow: hidden; 
  display: flex;
}

* {
  box-sizing: border-box;
  transition: all 0.2s ease;
}

/* RIGHT SIDE - VISUAL */
.visual-side {
  height: 100vh; 
  
  width: 45%;
  background: radial-gradient(circle at top left, #2E1065, #0F172A);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
  border-left: 1px solid #334155;
}

/* Abstract code background decoration */
.code-bg {
  position: absolute;
  font-family: 'JetBrains Mono', monospace;
  color: rgba(255,255,255,0.03);
  font-size: 1.5rem;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
  padding: 20px;
  direction: ltr; /* Code stays LTR */
  text-align: left;
}

.mascot-container {
  z-index: 2;
  text-align: center;
}

.mascot-img {
  width: 300px;
  filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.4));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.visual-text {
  z-index: 2;
  text-align: center;
  margin-top: 2rem;
}

.visual-text h2 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
}
.visual-text p {
  color: hsl(var(--muted-foreground));
  font-size: 1.1rem;
}

/* LEFT SIDE - FORM */
.form-side {
  height: 100vh; 
  width: 55%;
  display: flex;
  flex-direction: column;
  
  align-items: center;
  padding: 40px;
  position: relative;
  overflow-y: auto;
}

.form-container {
  width: 100%;
  max-width: 480px;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 0.9rem;
  color: hsl(var(--secondary));
  font-weight: bold;
}
.progress-bar {
  height: 6px;
  background: #334155;
  width: 100px;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  width: 33%;
  background: hsl(var(--secondary));
}

h1 {
  margin: 0 0 10px 0;
  font-size: 2.2rem;
  font-weight: 900;
}
.subtitle {
  color: hsl(var(--muted-foreground));
  margin-bottom: 30px;
  font-size: 1rem;
}

/* GAMIFIED INPUTS */
.input-group {
  margin-bottom: 20px;
}
.label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: hsl(var(--muted-foreground));
}

.input-field {
  width: 100%;
  padding: 16px;
  background: hsl(var(--card));
  border: 2px solid #334155;
  border-radius: 12px;
  color: white;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 1rem;
}

/* Special style for Email/Password to type in English */
.input-ltr {
  font-family: 'JetBrains Mono', monospace;
  direction: ltr;
  text-align: right; /* Placeholder on right */
}
.input-ltr:focus {
  text-align: left; /* Type on left */
}

.input-field:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

/* CHOOSE YOUR CLASS */
.class-selection {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 30px;
}

.class-card {
  background: hsl(var(--card));
  border: 2px solid #334155;
  border-radius: 12px;
  padding: 15px 10px;
  text-align: center;
  cursor: pointer;
  position: relative;
}

.class-card:hover, .class-card.active {
  border-color: hsl(var(--secondary));
  background: rgba(16, 185, 129, 0.1);
  transform: translateY(-3px);
}

.class-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: hsl(var(--foreground));
}
.class-name {
  font-size: 0.8rem;
  font-weight: bold;
}

/* Badge Position for RTL */
.xp-bonus {
  position: absolute;
  top: -8px;
  left: -8px; /* Left instead of Right for RTL */
  background: hsl(var(--primary));
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
  font-family: 'JetBrains Mono', monospace;
}

/* SUBMIT BUTTON */
.btn-start {
  width: 100%;
  padding: 18px;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 0 #059669; /* darker secondary for shadow */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Vazirmatn', sans-serif;
}

.btn-start:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-start:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: none;
}

/* SOCIAL LOGIN */
.social-divider {
    margin-top: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 0.8rem;
}
.social-divider::before, 
.social-divider::after {
    content: '';
    flex: 1;            /* Takes up available space */
    height: 1px;        /* Thickness of the line */
    background: #334155;
    opacity: 0.5;
}

/* Adds space around the text */
.social-divider span {
    padding: 0 12px;
}
.social-text {
  background: hsl(var(--background));
  padding: 0 10px;
  position: relative;
  z-index: 1;
  color: hsl(var(--muted-foreground));
  font-size: 0.8rem;
}
.social-icons {
    display: flex; 
    gap: 15px; 
    justify-content: center; 
    margin-top: 20px; 
}
.social-btn {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: hsl(var(--card));
  border: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}
.social-btn:hover {
  background: #334155;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: hsl(var(--muted-foreground));
}

.login-link a {
  color: hsl(var(--secondary));
  text-decoration: none;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .visual-side {
    display: none;
  }
  .form-side {
    width: 100%;
  }
}
</style>
