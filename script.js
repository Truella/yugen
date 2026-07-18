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
  const rings = document.querySelectorAll(".blob-ring")

  // ---- Split headline into word spans ----
  headline.textContent = "Something big is brewing."
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
      x: 0, y: 0, opacity: 0,
      ...from,
      duration: 0.4,
      ease: "back.out(1.7)",
    }, i * 0.1)
  })

  // Subtext
  tl.from(subtext, { y: 15, opacity: 0, duration: 0.35 }, ">0.05")

  // Input
  tl.from(emailInput, { x: -60, opacity: 0, duration: 0.35 }, ">0.05")

  // Button
  tl.from(submitBtn, { scale: 0, opacity: 0, duration: 0.3, ease: "back.out(2)" }, ">0.05")

  // Microtext
  tl.from(microtext, { y: 12, opacity: 0, duration: 0.3 }, ">0.05")

  // Count-up
  const target = parseInt(countEl.dataset.target, 10) || 212
  const countObj = { val: 0 }
  tl.to(countObj, {
    val: target,
    duration: 0.75,
    ease: "power2.out",
    onUpdate: () => { countEl.textContent = Math.round(countObj.val) },
  }, ">0")

  // Rings — fade in staggered from innermost outward; no scale to avoid CSS transform conflict
  tl.from(rings, {
    opacity: 0,
    duration: 0.7,
    stagger: { each: 0.08, from: "end" },
    ease: "power2.out",
  }, 0)

  // Idle breathing pulse on the whole blob stack
  gsap.to(".blob-stack", {
    scale: 1.025,
    duration: 7,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    transformOrigin: "center center",
  })

  // ---- Wipe / hover state ----
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

    // UI element colors
    gsap.to(hero, {
      "--text-color":  light ? "#d7dca3" : "#454b1b",
      "--btn-bg":      light ? "#d7dca3" : "#454b1b",
      "--btn-text":    light ? "#454b1b" : "#d7dca3",
      "--input-border":light ? "#d7dca3" : "#454b1b",
      duration: 0.7,
      ease: "power2.inOut",
      overwrite: "auto",
    })

    // Per-ring color swap — ring-3 is the pivot (stays same in both states)
    gsap.to(hero, {
      "--ring1-fill":    light ? "#525825" : "#c3ca85",
      "--ring1-opacity": light ? 1         : 0.2,
      "--ring2-fill":    light ? "#5f652f" : "#b6bd7a",
      "--ring2-opacity": light ? 0.88      : 0.4,
      "--ring3-fill":    "#9aa363",
      "--ring3-opacity": 0.52,
      "--ring4-fill":    light ? "#c9cf92" : "#7d8447",
      "--ring4-opacity": light ? 0.4       : 0.72,
      "--ring5-fill":    light ? "#d7dca3" : "#5f652f",
      "--ring5-opacity": light ? 0.28      : 0.88,
      "--ring6-fill":    light ? "#e8ebb8" : "#454b1b",
      "--ring6-opacity": light ? 0.18      : 1,
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

  // ---- Button micro-interactions ----
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
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Sent"
    submitBtn.disabled = true
    setTimeout(() => {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }, 2000)
  })
})
