window.onerror = function(message, url, line, col, error) {
    console.error("Error:", message, url, line, col, error);
  };

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');
    const prompt = document.getElementById('prompt');
    const themeToggle = document.getElementById('theme-toggle');

    let commandHistory = [];
    let historyIndex = -1;
    let commands = ['help', 'whoami', 'social', 'resume', 'cv', 'cert', 'projects', 'systemctl', 'email', 'banner', 'clear', 'history', 'linkedin', 'twitter', 'instagram', 'github', 'facebook'];

    function scrollToBottom() {
        const terminalContent = document.getElementById('terminal-content');
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    function smoothScrollToBottom() {
        const terminalContent = document.getElementById('terminal-content');
        const targetScrollTop = terminalContent.scrollHeight - terminalContent.clientHeight;
        const startScrollTop = terminalContent.scrollTop;
        const distance = targetScrollTop - startScrollTop;
        const duration = 300;
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            terminalContent.scrollTop = startScrollTop + distance * easeOutCubic(percentage);
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        }

        window.requestAnimationFrame(step);
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function addLine(text, style = '') {
        const line = document.createElement('p');
        line.className = style;
        
        const parts = text.split('$');
        if (parts.length > 1) {
            const promptSpan = document.createElement('span');
            promptSpan.className = 'prompt-color';
            promptSpan.textContent = parts[0] + '$';
            line.appendChild(promptSpan);
            
            line.innerHTML += parts[1];
        } else {
            line.innerHTML = text;
        }
        
        output.appendChild(line);
        
        smoothScrollToBottom();
    }

    async function executeCommand(cmd) {
        addLine(`${prompt.textContent} ${cmd}`, 'command-echo');
        
        const command = cmd.toLowerCase().trim();
        switch(command) {
            case 'help':
                loopLines(help, 'color2 margin');
                break;
            case 'whoami':
                loopLines(await fetchData('whoami'), 'color2 margin');
                break;
            case 'social':
                loopLines(await fetchData('social'), 'color2 margin');
                break;
            case 'resume':
            case 'cv':
                addLine("Opening resume...", "color2");
                showLoadAnimation(async () => window.open(await fetchData('resume'), "_blank"));
                break;
            case 'cert':
                loopLines(cert, 'color2 margin');
                break;
            case 'projects':
                loopLines(await fetchData('projects'), 'color2 margin');
                break;
            case 'systemctl':
                loopLines(await fetchData('systemctl'), 'color2 margin');
                break;
            case 'email':
                addLine(await fetchData('email'), "color2");
                break;
            case 'banner':
                loopLines(banner, "");
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'history':
                loopLines(commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`), 'color2');
                break;
            case 'linkedin':
            case 'twitter':
            case 'instagram':
            case 'github':
            case 'facebook':
                addLine(`Opening ${command}...`, "color2");
                showLoadAnimation(async () => window.open(await fetchData(command), "_blank"));
                break;
            default:
                const suggestion = commands.find(c => c.startsWith(command));
                if (suggestion) {
                    addLine(`Command not found. Did you mean '${suggestion}'?`, 'error');
                } else {
                    addLine(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
                }
        }

        smoothScrollToBottom();
    }

    function ensureScrolled() {
        requestAnimationFrame(scrollToBottom);
    }

    function loopLines(lines, style) {
        lines.forEach((line, index) => {
            setTimeout(() => {
                addLine(line, style);
                if (index === lines.length - 1) {
                    smoothScrollToBottom();
                }
            }, index * 50);
        });
    }

    function showLoadAnimation(callback) {
        const loadingText = "Loading";
        const loadingElement = document.createElement('p');
        loadingElement.className = 'loading';
        output.appendChild(loadingElement);

        let dots = 0;
        const loadInterval = setInterval(() => {
            loadingElement.textContent = loadingText + '.'.repeat(dots);
            dots = (dots + 1) % 4;
        }, 300);

        setTimeout(() => {
            clearInterval(loadInterval);
            loadingElement.remove();
            callback();
            smoothScrollToBottom();
        }, 2000);
    }

    async function fetchData(key) {
        switch(key) {
            case 'whoami':
                return whoami;
            case 'social':
                return social;
            case 'systemctl':
                return systemctl;
            case 'projects':
                return projects;
            case 'resume':
                return resume || "#";
            case 'email':
                return email;
            case 'linkedin':
                return linkedin;
            case 'twitter':
                return twitter;
            case 'github':
                return github;
            case 'instagram':
                return instagram;
            case 'facebook':
                return facebook;
            case 'cert':
                return cert;
            default:
                return `Data for ${key} not found`;
        }
        ensureScrolled();
    }

    function autocomplete(input) {
        return commands.find(cmd => cmd.startsWith(input.toLowerCase())) || input;
    }

    commandInput.addEventListener('input', () => {
        const input = commandInput.value;
        const suggestion = autocomplete(input);
        if (suggestion !== input) {
            commandInput.value = input;
            commandInput.setAttribute('placeholder', suggestion.slice(input.length));
        } else {
            commandInput.setAttribute('placeholder', '');
        }
    });

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const suggestion = autocomplete(commandInput.value);
            commandInput.value = suggestion;
            commandInput.setAttribute('placeholder', '');
        }
    });

    commandInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value;
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            executeCommand(command);
            commandInput.value = '';
            commandInput.setAttribute('placeholder', '');
            smoothScrollToBottom();
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                commandInput.value = '';
            }
        }
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        themeToggle.innerHTML = document.body.classList.contains('light-mode') ? '<i class="bx bxs-moon"></i>' : '<i class="bx bxs-sun"></i>';
    });

    loopLines(banner, "");
    initParticleBackground();

    const cursor = document.querySelector('.cursor');
    const links = document.querySelectorAll('a, button, input, .social-link, #theme-toggle');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('expand');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('expand');
    });

    links.forEach(link => {
        link.addEventListener('mouseover', () => {
            cursor.classList.add('hover');
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });

    window.addEventListener('resize', ensureScrolled);

});

function initParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-bg';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const colors = ['#e7cfaa', '#a19274', '#9e816e', '#938074']; 

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1; 
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.size > 0.2) this.size -= 0.05;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function handleParticles() {
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            if (particlesArray[i].size <= 0.2) {
                particlesArray.splice(i, 1);
                i--;
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (Math.random() < 0.05) { 
            particlesArray.push(new Particle());
        }
        handleParticles();
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.addEventListener('resize', showMobileWarning);
}

function createAsteroids() {
    const asteroidCount = 50; 
    const container = document.body;

    for (let i = 0; i < asteroidCount; i++) {
        const asteroid = document.createElement('div');
        asteroid.classList.add('asteroid');
        
        const size = Math.random() * 5 + 2;
        asteroid.style.width = `${size}px`;
        asteroid.style.height = `${size}px`;
        
        asteroid.style.left = `${Math.random() * 100}%`;
        asteroid.style.top = `${Math.random() * 100}%`;
        
        asteroid.style.animation = `float ${15 + Math.random() * 25}s linear infinite`;
        asteroid.style.animationDelay = `${Math.random() * 10}s`;
        
        container.appendChild(asteroid);
    }
}

function createStarfield() {
    const starfieldContainer = document.createElement('div');
    starfieldContainer.id = 'starfield';
    document.body.appendChild(starfieldContainer);

    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${3 + Math.random() * 7}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starfieldContainer.appendChild(star);
    }
}

function enhanceSaturn() {
    let saturn = document.getElementById('saturn');
    if (!saturn) {
        saturn = document.createElement('div');
        saturn.id = 'saturn';
        document.body.appendChild(saturn);
    }
    saturn.style.filter = 'drop-shadow(0 0 20px rgba(231, 207, 170, 0.7))';
    saturn.style.transform = 'scale(1.2)';
}

window.addEventListener('load', () => {
    createStarfield();
    createAsteroids();
    enhanceSaturn();
    floatAsteroids();
});

function floatAsteroids() {
    const asteroids = document.querySelectorAll('.asteroid');
    asteroids.forEach(asteroid => {
        setInterval(() => {
            asteroid.style.transform = `translate(${Math.sin(Date.now() / 1000) * 10}px, ${Math.cos(Date.now() / 1000) * 10}px)`;
        }, 50);
    });
}

window.addEventListener('load', () => {
    createStarfield();
    createAsteroids();
    enhanceSaturn();
    floatAsteroids();
});

window.addEventListener('load', initParticleBackground);

function adjustBackgroundElements() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const area = width * height;
    
    const particleCount = Math.floor(area / 10000);
    const starCount = Math.floor(area / 5000);
    
}

window.addEventListener('load', adjustBackgroundElements);
window.addEventListener('resize', adjustBackgroundElements);

function showMobileWarning() {
    if (window.innerWidth <= 768) {
    } else {
        const existingWarning = document.getElementById('mobile-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
    }
}

function handleTouchDevice() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.querySelector('.cursor').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', handleTouchDevice);

window.addEventListener('resize', smoothScrollToBottom);