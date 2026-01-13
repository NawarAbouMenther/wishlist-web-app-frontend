<template>
  <div id="app">
    <!-- 🌟 Header -->
    <header class="header">
      <div class="header-content">
        <img src="/logo.png" alt="Logo" class="logo" @click="$router.push('/')" />
        <h1 class="title">Wunschlisten-Creator</h1>
      </div>
    </header>

    <!-- 🌟 Seiteninhalt -->
    <main class="main-wrapper">
      <router-view />
    </main>
  </div>
</template>

<style>
/* 🌈 Hintergrund – neues helles Pastell-Design */
body::before {
  content: "";
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 65vw;
  height: 65vw;
  background-image: url("/logo.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.07;
  pointer-events: none;
  filter: blur(2px);
  z-index: 0;
}


@keyframes gradientShift {
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
  100% {background-position: 0% 50%;}
}

/* 🌟 HEADER */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 110px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  z-index: 999;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-left: 35px;
}

/* 🐻 Logo – größer + Glow */
.logo {
  height: 110px;
  cursor: pointer;
  transition: 0.25s ease;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.18));
}

.logo:hover {
  transform: scale(1.10);
  filter: drop-shadow(0 6px 16px rgb(237, 107, 196));
}

/* 💖 Titel – helleres Pink */
.title {
  font-size: 2.4rem;
  margin: 0;
  color: #ed6bc4;
  font-weight: 800;
  text-shadow: 0 2px 15px rgba(255, 255, 255, 0.6);
}

/* 📄 Inhaltsbereich */
.main-wrapper {
  padding-top: 150px; /* Platz für Header */
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
