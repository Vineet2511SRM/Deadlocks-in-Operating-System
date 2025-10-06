// Navigation Active State
document.addEventListener("DOMContentLoaded", () => {
  new ParticleSystem()

  const navLinks = document.querySelectorAll(".nav-link")
  const sections = document.querySelectorAll("section[id]")

  // Update active nav link on scroll
  window.addEventListener("scroll", () => {
    let current = ""
    sections.forEach((section) => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.clientHeight
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id")
      }
    })

    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href").slice(1) === current) {
        link.classList.add("active")
      }
    })
  })

  // Initialize hero animation
  initHeroAnimation()

  initInteractiveLab()

  animateStatsOnScroll()
})

// Smooth scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: "smooth" })
  }
}

// Toggle card expansion
function toggleCard(card) {
  const isExpanded = card.classList.contains("expanded")

  // Close all cards
  document.querySelectorAll(".type-card").forEach((c) => {
    c.classList.remove("expanded")
  })

  // Open clicked card if it wasn't already open
  if (!isExpanded) {
    card.classList.add("expanded")
  }
}

// Hero Animation - Draw connection lines
function initHeroAnimation() {
  const svg = document.getElementById("connectionLines")
  if (!svg) return

  const processA = document.getElementById("processA")
  const processB = document.getElementById("processB")
  const resource1 = document.getElementById("resource1")
  const resource2 = document.getElementById("resource2")

  function drawLine(from, to, color, dashArray = "5,5") {
    const fromRect = from.getBoundingClientRect()
    const toRect = to.getBoundingClientRect()
    const svgRect = svg.getBoundingClientRect()

    const x1 = fromRect.left + fromRect.width / 2 - svgRect.left
    const y1 = fromRect.top + fromRect.height / 2 - svgRect.top
    const x2 = toRect.left + toRect.width / 2 - svgRect.left
    const y2 = toRect.top + toRect.height / 2 - svgRect.top

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", x1)
    line.setAttribute("y1", y1)
    line.setAttribute("x2", x2)
    line.setAttribute("y2", y2)
    line.setAttribute("stroke", color)
    line.setAttribute("stroke-width", "2")
    line.setAttribute("stroke-dasharray", dashArray)
    line.style.opacity = "0.6"

    return line
  }

  function updateLines() {
    svg.innerHTML = ""

    // Process A holds Resource 1
    const line1 = drawLine(processA, resource1, "#00d9ff", "0")
    svg.appendChild(line1)

    // Process A requests Resource 2
    const line2 = drawLine(processA, resource2, "#7c4dff", "5,5")
    svg.appendChild(line2)

    // Process B holds Resource 2
    const line3 = drawLine(processB, resource2, "#00d9ff", "0")
    svg.appendChild(line3)

    // Process B requests Resource 1
    const line4 = drawLine(processB, resource1, "#7c4dff", "5,5")
    svg.appendChild(line4)
  }

  updateLines()
  window.addEventListener("resize", updateLines)
}

function showTypeDemo(type) {
  const demoId = `demo-${type}`
  const demoContainer = document.getElementById(demoId)

  // Reset any previous animations
  resetTypeDemo(demoId)

  // Start the specific demo based on type
  switch (type) {
    case "reusable":
      animateReusableDemo(demoContainer)
      break
    case "consumable":
      animateConsumableDemo(demoContainer)
      break
    case "synchronization":
      animateSynchronizationDemo(demoContainer)
      break
  }
}

function resetTypeDemo(demoId) {
  const container = document.getElementById(demoId)
  if (!container) return

  // Remove all classes and reset states
  container.querySelectorAll(".inline-process, .inline-resource, .inline-lock").forEach((el) => {
    el.classList.remove("waiting", "active", "blocked", "held", "locked")
  })

  // Clear SVG connections
  const svg = container.querySelector(".inline-connections")
  if (svg) svg.innerHTML = ""

  // Reset messages
  container.querySelectorAll(".message").forEach((msg) => {
    msg.classList.remove("sending")
  })
}

function animateReusableDemo(container) {
  const processes = container.querySelectorAll(".inline-process")
  const resources = container.querySelectorAll(".inline-resource")
  const svg = container.querySelector(".inline-connections")

  const steps = [
    {
      delay: 0,
      action: () => {
        processes[0].classList.add("active")
        drawInlineConnection(container, processes[0], resources[0], "#00e676", svg)
      },
    },
    {
      delay: 1000,
      action: () => {
        resources[0].classList.add("held")
      },
    },
    {
      delay: 1500,
      action: () => {
        processes[1].classList.add("active")
        drawInlineConnection(container, processes[1], resources[1], "#00e676", svg)
      },
    },
    {
      delay: 2500,
      action: () => {
        resources[1].classList.add("held")
      },
    },
    {
      delay: 3000,
      action: () => {
        processes[0].classList.remove("active")
        processes[0].classList.add("waiting")
        drawInlineConnection(container, processes[0], resources[1], "#ffd600", svg, true)
      },
    },
    {
      delay: 4000,
      action: () => {
        processes[1].classList.remove("active")
        processes[1].classList.add("waiting")
        drawInlineConnection(container, processes[1], resources[0], "#ffd600", svg, true)
      },
    },
    {
      delay: 5000,
      action: () => {
        processes[0].classList.remove("waiting")
        processes[0].classList.add("blocked")
        processes[1].classList.remove("waiting")
        processes[1].classList.add("blocked")

        // Redraw connections in red
        svg.innerHTML = ""
        drawInlineConnection(container, processes[0], resources[0], "#ff1744", svg)
        drawInlineConnection(container, processes[0], resources[1], "#ff1744", svg, true)
        drawInlineConnection(container, processes[1], resources[1], "#ff1744", svg)
        drawInlineConnection(container, processes[1], resources[0], "#ff1744", svg, true)
      },
    },
  ]

  steps.forEach((step) => setTimeout(step.action, step.delay))
}

function animateConsumableDemo(container) {
  const processes = container.querySelectorAll(".inline-process")
  const messages = container.querySelectorAll(".message")

  const steps = [
    {
      delay: 0,
      action: () => {
        processes[0].classList.add("waiting")
        processes[0].querySelector(".process-label").textContent = "P1 (waiting for msg)"
      },
    },
    {
      delay: 1000,
      action: () => {
        processes[1].classList.add("waiting")
        processes[1].querySelector(".process-label").textContent = "P2 (waiting for msg)"
      },
    },
    {
      delay: 2000,
      action: () => {
        messages[0].classList.add("sending")
      },
    },
    {
      delay: 4000,
      action: () => {
        messages[0].classList.remove("sending")
      },
    },
    {
      delay: 4500,
      action: () => {
        processes[0].classList.remove("waiting")
        processes[0].classList.add("blocked")
        processes[1].classList.remove("waiting")
        processes[1].classList.add("blocked")
        processes[0].querySelector(".process-label").textContent = "P1 (BLOCKED)"
        processes[1].querySelector(".process-label").textContent = "P2 (BLOCKED)"
      },
    },
  ]

  steps.forEach((step) => setTimeout(step.action, step.delay))
}

function animateSynchronizationDemo(container) {
  const threads = container.querySelectorAll(".inline-process")
  const locks = container.querySelectorAll(".inline-lock")
  const svg = container.querySelector(".inline-connections")

  const steps = [
    {
      delay: 0,
      action: () => {
        threads[0].classList.add("active")
        threads[0].querySelector(".lock-status").textContent = "🔓"
      },
    },
    {
      delay: 1000,
      action: () => {
        locks[0].classList.add("locked")
        locks[0].querySelector(".lock-icon").textContent = "🔐"
        drawInlineConnection(container, threads[0], locks[0], "#00e676", svg)
        threads[0].querySelector(".lock-status").textContent = "🔐"
      },
    },
    {
      delay: 2000,
      action: () => {
        threads[1].classList.add("active")
        threads[1].querySelector(".lock-status").textContent = "🔓"
      },
    },
    {
      delay: 3000,
      action: () => {
        locks[1].classList.add("locked")
        locks[1].querySelector(".lock-icon").textContent = "🔐"
        drawInlineConnection(container, threads[1], locks[1], "#00e676", svg)
        threads[1].querySelector(".lock-status").textContent = "🔐"
      },
    },
    {
      delay: 4000,
      action: () => {
        threads[0].classList.remove("active")
        threads[0].classList.add("waiting")
        drawInlineConnection(container, threads[0], locks[1], "#ffd600", svg, true)
      },
    },
    {
      delay: 5000,
      action: () => {
        threads[1].classList.remove("active")
        threads[1].classList.add("waiting")
        drawInlineConnection(container, threads[1], locks[0], "#ffd600", svg, true)
      },
    },
    {
      delay: 6000,
      action: () => {
        threads[0].classList.remove("waiting")
        threads[0].classList.add("blocked")
        threads[1].classList.remove("waiting")
        threads[1].classList.add("blocked")

        // Redraw all connections in red
        svg.innerHTML = ""
        drawInlineConnection(container, threads[0], locks[0], "#ff1744", svg)
        drawInlineConnection(container, threads[0], locks[1], "#ff1744", svg, true)
        drawInlineConnection(container, threads[1], locks[1], "#ff1744", svg)
        drawInlineConnection(container, threads[1], locks[0], "#ff1744", svg, true)
      },
    },
  ]

  steps.forEach((step) => setTimeout(step.action, step.delay))
}

function drawInlineConnection(container, from, to, color, svg, dashed = false) {
  if (!svg) return

  const containerRect = container.getBoundingClientRect()
  const fromRect = from.getBoundingClientRect()
  const toRect = to.getBoundingClientRect()

  const x1 = fromRect.left + fromRect.width / 2 - containerRect.left
  const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
  const x2 = toRect.left + toRect.width / 2 - containerRect.left
  const y2 = toRect.top + toRect.height / 2 - containerRect.top

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
  line.setAttribute("x1", x1)
  line.setAttribute("y1", y1)
  line.setAttribute("x2", x2)
  line.setAttribute("y2", y2)
  line.setAttribute("stroke", color)
  line.setAttribute("stroke-width", "3")

  if (dashed) {
    line.setAttribute("stroke-dasharray", "5,5")
  }

  // Add arrow marker
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
  marker.setAttribute("id", `arrow-${Date.now()}-${Math.random()}`)
  marker.setAttribute("markerWidth", "10")
  marker.setAttribute("markerHeight", "10")
  marker.setAttribute("refX", "5")
  marker.setAttribute("refY", "3")
  marker.setAttribute("orient", "auto")

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygon.setAttribute("points", "0 0, 10 3, 0 6")
  polygon.setAttribute("fill", color)

  marker.appendChild(polygon)
  svg.appendChild(marker)
  line.setAttribute("marker-end", `url(#${marker.id})`)

  svg.appendChild(line)
}

// Demo functionality
let demoInterval
let demoStep = 0
let demoPaused = false

function showDemo(type) {
  // Scroll to demo section
  scrollToSection("demo")

  // Reset and start demo after scroll
  setTimeout(() => {
    resetDemo()
    startDemo(type)
  }, 500)
}

function startDemo(type) {
  if (demoPaused) {
    demoPaused = false
    const button = document.querySelector(".control-button.tertiary .button-icon")
    button.textContent = "⏸"
  }

  resetDemo()

  const logContent = document.getElementById("logContent")
  const statusA = document.getElementById("statusA")
  const statusB = document.getElementById("statusB")
  const holder1 = document.getElementById("holder1")
  const holder2 = document.getElementById("holder2")

  const steps = [
    {
      delay: 0,
      action: () => {
        if (demoPaused) return
        addLog("Simulation started...", "")
        addLog("Process A and Process B are ready to execute", "")
        drawDemoConnection("demoProcessA", "demoResource1", "waiting")
      },
    },
    {
      delay: 1500,
      action: () => {
        if (demoPaused) return
        statusA.textContent = "Acquiring R1..."
        statusA.style.background = "rgba(255, 215, 0, 0.2)"
        addLog("Process A: Requesting Resource 1", "warning")
      },
    },
    {
      delay: 2500,
      action: () => {
        if (demoPaused) return
        statusA.textContent = "Holds R1"
        statusA.style.background = "rgba(0, 230, 118, 0.2)"
        holder1.textContent = "Held by A"
        holder1.style.background = "rgba(0, 230, 118, 0.2)"
        addLog("Process A: Acquired Resource 1 ✓", "success")
        drawDemoConnection("demoProcessA", "demoResource1", "active")
      },
    },
    {
      delay: 3500,
      action: () => {
        if (demoPaused) return
        statusB.textContent = "Acquiring R2..."
        statusB.style.background = "rgba(255, 215, 0, 0.2)"
        addLog("Process B: Requesting Resource 2", "warning")
        drawDemoConnection("demoProcessB", "demoResource2", "waiting")
      },
    },
    {
      delay: 4500,
      action: () => {
        if (demoPaused) return
        statusB.textContent = "Holds R2"
        statusB.style.background = "rgba(0, 230, 118, 0.2)"
        holder2.textContent = "Held by B"
        holder2.style.background = "rgba(0, 230, 118, 0.2)"
        addLog("Process B: Acquired Resource 2 ✓", "success")
        drawDemoConnection("demoProcessB", "demoResource2", "active")
      },
    },
    {
      delay: 5500,
      action: () => {
        if (demoPaused) return
        statusA.textContent = "Waiting for R2..."
        statusA.style.background = "rgba(255, 23, 68, 0.2)"
        addLog("Process A: Requesting Resource 2 (held by B)", "warning")
        drawDemoConnection("demoProcessA", "demoResource2", "blocked")
      },
    },
    {
      delay: 6500,
      action: () => {
        if (demoPaused) return
        statusB.textContent = "Waiting for R1..."
        statusB.style.background = "rgba(255, 23, 68, 0.2)"
        addLog("Process B: Requesting Resource 1 (held by A)", "warning")
        drawDemoConnection("demoProcessB", "demoResource1", "blocked")
      },
    },
    {
      delay: 7500,
      action: () => {
        if (demoPaused) return
        addLog("⚠️ DEADLOCK DETECTED!", "error")
        addLog("Process A waits for Resource 2 (held by B)", "error")
        addLog("Process B waits for Resource 1 (held by A)", "error")
        addLog("Circular wait condition exists - System is deadlocked!", "error")
      },
    },
  ]

  steps.forEach((step) => {
    setTimeout(step.action, step.delay)
  })
}

function resetDemo() {
  clearInterval(demoInterval)
  demoStep = 0

  const logContent = document.getElementById("logContent")
  const statusA = document.getElementById("statusA")
  const statusB = document.getElementById("statusB")
  const holder1 = document.getElementById("holder1")
  const holder2 = document.getElementById("holder2")

  logContent.innerHTML = '<p class="log-entry">Click "Start Simulation" to begin...</p>'

  statusA.textContent = "Ready"
  statusA.style.background = "rgba(124, 77, 255, 0.2)"

  statusB.textContent = "Ready"
  statusB.style.background = "rgba(124, 77, 255, 0.2)"

  holder1.textContent = "Available"
  holder1.style.background = "rgba(0, 217, 255, 0.2)"

  holder2.textContent = "Available"
  holder2.style.background = "rgba(0, 217, 255, 0.2)"
}

function addLog(message, type) {
  const logContent = document.getElementById("logContent")
  const entry = document.createElement("p")
  entry.className = `log-entry ${type}`
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`
  logContent.appendChild(entry)
  logContent.scrollTop = logContent.scrollHeight
}

function pauseDemo() {
  demoPaused = !demoPaused
  const button = event.target.closest(".control-button")
  const icon = button.querySelector(".button-icon")
  icon.textContent = demoPaused ? "▶" : "⏸"
}

function drawDemoConnection(fromId, toId, type) {
  const svg = document.getElementById("demoConnections")
  if (!svg) return

  const fromEl = document.getElementById(fromId)
  const toEl = document.getElementById(toId)

  if (!fromEl || !toEl) return

  const fromRect = fromEl.getBoundingClientRect()
  const toRect = toEl.getBoundingClientRect()
  const svgRect = svg.getBoundingClientRect()

  const x1 = fromRect.left + fromRect.width / 2 - svgRect.left
  const y1 = fromRect.top + fromRect.height / 2 - svgRect.top
  const x2 = toRect.left + toRect.width / 2 - svgRect.left
  const y2 = toRect.top + toRect.height / 2 - svgRect.top

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
  line.setAttribute("x1", x1)
  line.setAttribute("y1", y1)
  line.setAttribute("x2", x2)
  line.setAttribute("y2", y2)
  line.setAttribute("stroke-width", "3")

  if (type === "active") {
    line.setAttribute("stroke", "#00e676")
    line.setAttribute("stroke-dasharray", "0")
  } else if (type === "blocked") {
    line.setAttribute("stroke", "#ff1744")
    line.setAttribute("stroke-dasharray", "5,5")
  } else {
    line.setAttribute("stroke", "#ffd600")
    line.setAttribute("stroke-dasharray", "5,5")
  }

  svg.appendChild(line)
}

// Add click handlers to nav links
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const targetId = link.getAttribute("href").slice(1)
    scrollToSection(targetId)
  })
})

// Particle animation system
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById("particleCanvas")
    this.ctx = this.canvas.getContext("2d")
    this.particles = []
    this.particleCount = 50
    this.init()
  }

  init() {
    this.resize()
    window.addEventListener("resize", () => this.resize())
    this.createParticles()
    this.animate()
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = document.body.scrollHeight
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle, i) => {
      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1

      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = `rgba(0, 217, 255, ${particle.opacity})`
      this.ctx.fill()

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[j].x - particle.x
        const dy = this.particles[j].y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          this.ctx.beginPath()
          this.ctx.moveTo(particle.x, particle.y)
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y)
          this.ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 * (1 - distance / 150)})`
          this.ctx.lineWidth = 0.5
          this.ctx.stroke()
        }
      }
    })

    requestAnimationFrame(() => this.animate())
  }
}

// Interactive lab functionality
let labItems = []
let selectedItem = null
let connections = []
let itemIdCounter = 0

function initInteractiveLab() {
  const canvas = document.getElementById("labCanvas")
  const draggableItems = document.querySelectorAll(".draggable-item")

  draggableItems.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart)
  })

  canvas.addEventListener("dragover", handleDragOver)
  canvas.addEventListener("drop", handleDrop)
  canvas.addEventListener("dragleave", handleDragLeave)
  canvas.addEventListener("click", handleCanvasClick)
}

function handleDragStart(e) {
  e.dataTransfer.setData("type", e.target.dataset.type)
}

function handleDragOver(e) {
  e.preventDefault()
  e.currentTarget.classList.add("drag-over")
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over")
}

function handleDrop(e) {
  e.preventDefault()
  const canvas = e.currentTarget
  canvas.classList.remove("drag-over")

  const type = e.dataTransfer.getData("type")
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  createLabItem(type, x, y)
}

function createLabItem(type, x, y) {
  const canvas = document.getElementById("labCanvas")
  const hint = canvas.querySelector(".canvas-hint")
  if (hint) hint.style.display = "none"

  const item = document.createElement("div")
  item.className = `dropped-item ${type}`
  item.style.left = `${x}px`
  item.style.top = `${y}px`
  item.dataset.id = itemIdCounter++
  item.dataset.type = type

  const icon = document.createElement("span")
  icon.textContent = type === "process" ? "⚙️" : "💾"

  const label = document.createElement("span")
  label.textContent = type === "process" ? `P${itemIdCounter}` : `R${itemIdCounter}`

  const remove = document.createElement("span")
  remove.className = "item-remove"
  remove.textContent = "✕"
  remove.onclick = (e) => {
    e.stopPropagation()
    removeLabItem(item)
  }

  item.appendChild(icon)
  item.appendChild(label)
  item.appendChild(remove)

  item.addEventListener("click", (e) => {
    e.stopPropagation()
    selectLabItem(item)
  })

  canvas.appendChild(item)
  labItems.push(item)
}

function selectLabItem(item) {
  if (selectedItem === item) {
    item.classList.remove("selected")
    selectedItem = null
  } else if (selectedItem === null) {
    item.classList.add("selected")
    selectedItem = item
  } else {
    // Create connection
    if (selectedItem.dataset.type !== item.dataset.type) {
      connections.push({
        from: selectedItem.dataset.id,
        to: item.dataset.id,
      })
      drawConnections()
    }
    selectedItem.classList.remove("selected")
    selectedItem = null
  }
}

function removeLabItem(item) {
  const id = item.dataset.id
  connections = connections.filter((c) => c.from !== id && c.to !== id)
  labItems = labItems.filter((i) => i !== item)
  item.remove()
  drawConnections()

  if (labItems.length === 0) {
    const canvas = document.getElementById("labCanvas")
    const hint = canvas.querySelector(".canvas-hint")
    if (hint) hint.style.display = "block"
  }
}

function handleCanvasClick(e) {
  if (e.target.id === "labCanvas") {
    if (selectedItem) {
      selectedItem.classList.remove("selected")
      selectedItem = null
    }
  }
}

function drawConnections() {
  // Remove existing connection lines
  document.querySelectorAll(".connection-line").forEach((line) => line.remove())

  const canvas = document.getElementById("labCanvas")

  connections.forEach((conn) => {
    const fromItem = labItems.find((i) => i.dataset.id === conn.from)
    const toItem = labItems.find((i) => i.dataset.id === conn.to)

    if (fromItem && toItem) {
      const line = document.createElement("div")
      line.className = "connection-line"
      line.style.position = "absolute"
      line.style.height = "2px"
      line.style.background = "var(--accent-primary)"
      line.style.transformOrigin = "0 0"
      line.style.pointerEvents = "none"
      line.style.zIndex = "0"

      const fromRect = fromItem.getBoundingClientRect()
      const toRect = toItem.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()

      const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left
      const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top
      const x2 = toRect.left + toRect.width / 2 - canvasRect.left
      const y2 = toRect.top + toRect.height / 2 - canvasRect.top

      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI

      line.style.left = `${x1}px`
      line.style.top = `${y1}px`
      line.style.width = `${length}px`
      line.style.transform = `rotate(${angle}deg)`

      canvas.appendChild(line)
    }
  })
}

function checkDeadlock() {
  const result = document.getElementById("labResult")

  if (labItems.length < 2) {
    result.className = "lab-result"
    result.textContent = "Add at least 2 items to check for deadlock"
    return
  }

  // Simple deadlock detection: check for circular dependencies
  const processes = labItems.filter((i) => i.dataset.type === "process")
  const resources = labItems.filter((i) => i.dataset.type === "resource")

  if (processes.length < 2 || resources.length < 2) {
    result.className = "lab-result"
    result.textContent = "Need at least 2 processes and 2 resources"
    return
  }

  // Check for circular wait
  let hasCircularWait = false
  processes.forEach((p1) => {
    processes.forEach((p2) => {
      if (p1 !== p2) {
        const p1Connections = connections.filter((c) => c.from === p1.dataset.id || c.to === p1.dataset.id)
        const p2Connections = connections.filter((c) => c.from === p2.dataset.id || c.to === p2.dataset.id)

        if (p1Connections.length > 0 && p2Connections.length > 0) {
          const sharedResources = p1Connections.filter((c1) =>
            p2Connections.some((c2) => c1.to === c2.to || c1.from === c2.from),
          )
          if (sharedResources.length > 0) {
            hasCircularWait = true
          }
        }
      }
    })
  })

  if (hasCircularWait && connections.length >= 4) {
    result.className = "lab-result error"
    result.textContent = "⚠️ DEADLOCK DETECTED! Circular wait condition exists."
  } else {
    result.className = "lab-result success"
    result.textContent = "✓ No deadlock detected. System is safe."
  }
}

function clearLab() {
  labItems.forEach((item) => item.remove())
  labItems = []
  connections = []
  selectedItem = null
  itemIdCounter = 0

  const canvas = document.getElementById("labCanvas")
  const hint = canvas.querySelector(".canvas-hint")
  if (hint) hint.style.display = "block"

  const result = document.getElementById("labResult")
  result.className = "lab-result"
  result.textContent = ""

  document.querySelectorAll(".connection-line").forEach((line) => line.remove())
}

function animateStatsOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target
          const target = Number.parseInt(card.dataset.stat)
          const number = card.querySelector(".stat-number")
          let current = 0

          const increment = target / 50
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              number.textContent = target
              clearInterval(timer)
            } else {
              number.textContent = Math.floor(current)
            }
          }, 30)

          observer.unobserve(card)
        }
      })
    },
    { threshold: 0.5 },
  )

  document.querySelectorAll(".stat-card").forEach((card) => {
    observer.observe(card)
  })
}
