document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero")
  const wipe = document.querySelector(".wipe")
  const headline = document.querySelector(".headline")
  const subtext = document.querySelector(".subtext")
  const form = document.querySelector(".waitlist-form")
  const emailInput = form.querySelector('input[type="email"]')
  const submitBtn = form.querySelector('button[type="submit"]')
  const microtext = document.querySelector(".microtext")
  const countEl = document.querySelector(".count")
  const shapes = document.querySelectorAll(".shape")

  // ---- Split headline into word spans ----
  headline.textContent = "Something quiet is coming"
  const words = headline.textContent.split(" ")
  headline.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(" ")
  const wordEls = headline.querySelectorAll(".word")

  // ---- Mount timeline ----
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } })

  // Headline — each word enters from a different direction
  const wordEntrances = [
    { y: -80, rotate: -8 },
    { x: -100, rotate: 5 },
    { x: 100, rotate: -5 },
    { y: 80, rotate: 8 },
  ]

  wordEls.forEach((el, i) => {
    const from = wordEntrances[i] || { y: -80, rotate: -8 }
    tl.from(el, {
      x: 0,
      y: 0,
      opacity: 0,
      ...from,
      duration: 0.4,
      ease: "back.out(1.7)",
    }, i * 0.1)
  })

  // Subtext — after headline lands
  tl.from(subtext, {
    y: 15,
    opacity: 0,
    duration: 0.35,
  }, ">0.05")

  // Input — slides from left
  tl.from(emailInput, {
    x: -60,
    opacity: 0,
    duration: 0.35,
  }, ">0.05")

  // Button — scale bounce
  tl.from(submitBtn, {
    scale: 0,
    opacity: 0,
    duration: 0.3,
    ease: "back.out(2)",
  }, ">0.05")

  // Microtext — simple fade up
  tl.from(microtext, {
    y: 12,
    opacity: 0,
    duration: 0.3,
  }, ">0.05")

  // Count-up
  const target = parseInt(countEl.dataset.target, 10) || 212
  const countObj = { val: 0 }
  tl.to(countObj, {
    val: target,
    duration: 0.75,
    ease: "power2.out",
    onUpdate: () => { countEl.textContent = Math.round(countObj.val) },
  }, ">0")

  // Shapes — scale up staggered across the sequence
  tl.from(shapes, {
    scale: 0,
    duration: 0.55,
    stagger: 0.12,
    ease: "back.out(1.4)",
  }, 0)

  // ---- Idle shape bobbing (after mount) ----
  const idleParams = [
    { y: -12, dur: 3.2 },
    { y: 8, dur: 4.0 },
    { y: -15, dur: 3.6 },
    { y: 10, dur: 2.8 },
  ]

  gsap.delayedCall(tl.duration() + 0.15, () => {
    idleParams.forEach((p, i) => {
      if (!shapes[i]) return
      gsap.to(shapes[i], {
        y: p.y,
        duration: p.dur,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2,
      })
    })
  })

  // ---- Wipe state ----
  let isWiped = false

  function applyState(wiped, direction) {
    const to = wiped ? 1 : 0

    if (direction) {
      wipe.style.transformOrigin = direction === "left" ? "left center" : "right center"
    }

    gsap.to(wipe, {
      scaleX: to,
      duration: 0.7,
      ease: "power2.inOut",
      overwrite: "auto",
    })

    const light = wiped
    gsap.to(hero, {
      "--text-color": light ? "#d7dca3" : "#454b1b",
      "--btn-bg": light ? "#d7dca3" : "#454b1b",
      "--btn-text": light ? "#454b1b" : "#d7dca3",
      "--input-border": light ? "#d7dca3" : "#454b1b",
      "--shape-color": light ? "#d7dca3" : "#454b1b",
      duration: 0.7,
      ease: "power2.inOut",
      overwrite: "auto",
    })

    isWiped = wiped
  }

  // Desktop hover
  if (window.matchMedia("(hover: hover)").matches) {
    let currentDirection = null

    hero.addEventListener("mouseenter", (e) => {
      const rect = hero.getBoundingClientRect()
      const x = e.clientX - rect.left
      currentDirection = x < rect.width / 2 ? "left" : "right"
      applyState(true, currentDirection)
    })

    hero.addEventListener("mouseleave", () => {
      if (isWiped) {
        applyState(false, currentDirection)
        currentDirection = null
      }
    })
  } else {
    // Mobile / touch — fire once, stay dark
    hero.addEventListener("touchstart", (e) => {
      if (isWiped) return
      const rect = hero.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const direction = x < rect.width / 2 ? "left" : "right"
      applyState(true, direction)
    })
  }

  // ---- Button hover/active micro-interaction ----
  submitBtn.addEventListener("mouseenter", () => {
    gsap.to(submitBtn, { scale: 1.03, duration: 0.2, ease: "power2.out", overwrite: "auto" })
  })
  submitBtn.addEventListener("mouseleave", () => {
    gsap.to(submitBtn, { scale: 1, duration: 0.2, ease: "power2.out", overwrite: "auto" })
  })
  submitBtn.addEventListener("mousedown", () => {
    gsap.to(submitBtn, { scale: 0.98, duration: 0.12, ease: "power2.out", overwrite: "auto" })
  })
  submitBtn.addEventListener("mouseup", () => {
    gsap.to(submitBtn, { scale: 1.03, duration: 0.12, ease: "power2.out", overwrite: "auto" })
  })

  // ---- Form submit ----
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    console.log(emailInput.value)
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Sent"
    submitBtn.disabled = true
    setTimeout(() => {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }, 2000)
  })
})
