import Experience from './Experience/Experience.js'
import UIManager from './ui.js'
import UIMobile from './ui-mobile.js'

const experience = new Experience(document.querySelector('canvas.webgl'))
const uiManager = new UIManager()
const mobileUI = new UIMobile(uiManager) // 🆕 Initialise l'UI mobile