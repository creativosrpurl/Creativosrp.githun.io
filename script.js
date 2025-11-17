document.addEventListener('DOMContentLoaded', () => {
  // Asegúrate de que ScrollTrigger esté registrado para usarlo
  gsap.registerPlugin(ScrollTrigger);

  // Utilidad: Toast no intrusivo
  const toastEl = document.getElementById('toast');
  const showToast = (msg, timeout = 2500) => {
    if (!toastEl) return alert(msg);
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.hidden = true;
      toastEl.textContent = '';
    }, timeout);
  };

  // ===============================================
  // 1. ANIMACIÓN DE FONDO Y ELEMENTOS PRINCIPALES (GSAP)
  // ===============================================

  // Animación de movimiento sutil al fondo
  gsap.to('#gta-bg', {
    duration: 30,
    backgroundPosition: '100% 100%',
    ease: 'none',
    repeat: -1,
    yoyo: true
  });

  // Animación de entrada del título
  gsap.from('.gta-title', {
    duration: 1.5,
    opacity: 0,
    y: -50,
    ease: 'bounce.out'
  });

  // ===============================================
  // 2. MENÚ DESPLEGABLE (INTERACTIVIDAD)
  // ===============================================

  const menuButton = document.getElementById('menu-button');
  const navbar = document.getElementById('navbar');
  const navLinks = navbar ? navbar.querySelectorAll('a') : [];

  const toggleMenu = () => {
    const isActive = navbar.classList.toggle('active');
    // Cambia icono y accesibilidad
    if (menuButton) {
      menuButton.textContent = isActive ? 'X' : '☰';
      menuButton.setAttribute('aria-expanded', String(isActive));
    }
  };

  if (menuButton) {
    menuButton.addEventListener('click', toggleMenu);
  }

  // Cierra el menú al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('active');
      if (menuButton) {
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ===============================================
  // 3. ASIGNACIÓN DE INFORMACIÓN DINÁMICA (IP Y CONTADOR)
  // ===============================================

  // --- CONFIGURACIÓN DEL SERVIDOR ---
  const SERVER_IP = '45.45.237.224:7779';
  const [SERVER_HOST, SERVER_PORT] = SERVER_IP.split(':');

  // Contenedor para la información del servidor
  const serverInfoContainer = document.getElementById('server-info-container');
  if (serverInfoContainer) {
    const infoBienvenida = document.createElement('p');
    infoBienvenida.className = 'gta-text info-asignada';
    infoBienvenida.innerHTML = `
      Estado: <strong><span id="jugadores-activos">--</span></strong><br> 
      IP: <strong>${SERVER_IP}</strong> 
      <button id="copy-ip-btn" class="gta-boton-copiar">Copiar IP</button>
    `;
    serverInfoContainer.appendChild(infoBienvenida);

    const copyIpBtn = document.getElementById('copy-ip-btn');
    if (copyIpBtn) {
      copyIpBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(SERVER_IP).then(() => {
          showToast('¡IP copiada al portapapeles!');
          copyIpBtn.textContent = '¡Copiado!';
          setTimeout(() => { copyIpBtn.textContent = 'Copiar IP'; }, 2000);
        }).catch(err => showToast('Error al copiar la IP.'));
      });
    }

    const jugadoresActivosEl = document.getElementById('jugadores-activos');

    // Función simplificada para mostrar siempre "Activo"
    function actualizarJugadores() {
      if (jugadoresActivosEl) {
        jugadoresActivosEl.textContent = 'Activo';
      }
    }

    // Actualiza al cargar y cada 60s
    actualizarJugadores(); // Llama a la función una vez para establecer el texto.
  }

  // ===============================================
  // 4. ANIMACIÓN DE PRODUCTOS (SCROLLTRIGGER)
  // ===============================================

  // Animación de los productos al hacer scroll (sin cambios de opacidad para mantener misma tonalidad)
  gsap.from('.gta-producto', {
    duration: 1,
    y: 30,
    stagger: 0.2,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '#tienda',
      start: 'top 80%',
    }
  });

  // ===============================================
  // 5. LÓGICA DE BOTONES Y FORMULARIO
  // ===============================================

  // ===============================================
  // 6. SONIDO DE INTERFAZ ESTILO SA-MP
  // ===============================================
  const uiSound = document.getElementById('ui-click-sound');
  let audioInitialized = false;

  // Función para reproducir el sonido
  const playClickSound = () => {
    if (uiSound && audioInitialized) {
      uiSound.currentTime = 0;
      uiSound.play().catch(e => console.warn("No se pudo reproducir el sonido:", e));
    }
  };

  // Inicializa el audio con el primer clic en cualquier lugar
  const initializeAudio = () => {
    if (!audioInitialized) {
      uiSound.play().then(() => {
        uiSound.pause();
        uiSound.currentTime = 0;
        audioInitialized = true;
      }).catch(() => {
        // El usuario necesita interactuar más
      });
      // Quita el listener para que no se ejecute más
      document.body.removeEventListener('click', initializeAudio);
    }
  };
  document.body.addEventListener('click', initializeAudio, { once: true });

  // Asigna el sonido a todos los elementos clicables
  if (uiSound) {
    const clickableElements = document.querySelectorAll('.gta-boton, .gta-navbar a, .gta-menu-button');
    clickableElements.forEach(el => el.addEventListener('click', playClickSound));
  }

  // ===============================================
  // 7. LÓGICA DE LA TIENDA Y MODAL DE PAYPAL
  // ===============================================
  const purchaseModal = document.getElementById('purchase-modal');
  const buyCoinsBtn = document.getElementById('buy-coins-btn');
  const buyHouseBtn = document.getElementById('buy-house-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTitle = document.getElementById('titulo-modal');

  // Pasos del Modal
  const paymentMethodStep = document.getElementById('payment-method-step');
  const paypalStep = document.getElementById('paypal-step');
  const nequiStep = document.getElementById('nequi-step');

  // Elementos del formulario
  const sampUsernameInput = document.getElementById('samp-username');
  const coinPackageSelect = document.getElementById('coin-package');
  const coinPackageLabel = document.querySelector('label[for="coin-package"]');
  const nequiPackageSelect = document.getElementById('nequi-coin-package');
  const nequiPackageLabel = document.querySelector('label[for="nequi-coin-package"]');
  const nequiAmountDisplay = document.getElementById('nequi-amount-display');

  // Botones de selección
  const selectPaypalBtn = document.getElementById('select-paypal-btn');
  const selectNequiBtn = document.getElementById('select-nequi-btn');

  // Variable para saber qué se está comprando
  let currentPurchase = '';

  // Abrir el modal
  const openModal = (purchaseType) => {
    currentPurchase = purchaseType;

    if (purchaseModal && modalTitle) {
      // Resetea a la vista inicial
      paymentMethodStep.hidden = false;
      paypalStep.hidden = true;
      nequiStep.hidden = true;
      purchaseModal.hidden = false;

      if (purchaseType === 'coins') {
        modalTitle.textContent = 'Comprar Coins';
        if (coinPackageSelect) coinPackageSelect.style.display = 'block';
        if (coinPackageLabel) coinPackageLabel.style.display = 'block';
        if (nequiPackageSelect) nequiPackageSelect.style.display = 'block';
        if (nequiPackageLabel) nequiPackageLabel.style.display = 'block';
      } else if (purchaseType === 'house') {
        modalTitle.textContent = 'Comprar Casa Privada';
        if (coinPackageSelect) coinPackageSelect.style.display = 'none';
        if (coinPackageLabel) coinPackageLabel.style.display = 'none';
        if (nequiPackageSelect) nequiPackageSelect.style.display = 'none';
        if (nequiPackageLabel) nequiPackageLabel.style.display = 'none';
      }
    }
  };

  if (buyCoinsBtn) {
    buyCoinsBtn.addEventListener('click', () => openModal('coins'));
  }

  if (buyHouseBtn) {
    buyHouseBtn.addEventListener('click', () => openModal('house'));
  }

  // Lógica de selección de método
  if (selectPaypalBtn) {
    selectPaypalBtn.addEventListener('click', () => {
      paymentMethodStep.hidden = true;
      paypalStep.hidden = false;
      renderPayPalButton();
    });
  }

  if (selectNequiBtn) {
    selectNequiBtn.addEventListener('click', () => {
      paymentMethodStep.hidden = true;
      nequiStep.hidden = false;

      // Si es una casa, ajusta el precio de Nequi directamente
      if (currentPurchase === 'house') {
        const housePriceCOP = 24000; // $6 USD a COP (aprox)
        const formattedAmount = new Intl.NumberFormat('es-CO').format(housePriceCOP);
        const displayStrongTag = nequiAmountDisplay.querySelector('strong');
        if (displayStrongTag) displayStrongTag.textContent = `$${formattedAmount} COP`;
      } else {
        // Si son coins, asegúrate de que el selector esté visible y actualiza el precio
        nequiPackageSelect.dispatchEvent(new Event('change'));
      }

      // --- SOLUCIÓN DEFINITIVA PARA CARGAR IMAGEN ---
      const nequiQR = document.getElementById('nequi-qr');
      if (nequiQR) {
        const baseImagePath = 'logos/codigo qr';
        const extensions = ['png', 'jpg', 'jpeg', 'webp'];
        let imageFound = false;

        const tryExtension = (index) => {
          if (index >= extensions.length) {
            if (!imageFound) {
              // Si ninguna extensión funcionó, muestra el error.
              nequiQR.alt = "Error: No se encontró la imagen 'codigo qr' con extensión .png, .jpg o .jpeg en la carpeta 'logos'.";
              nequiQR.src = ''; // Limpia el src para forzar la muestra del texto 'alt'.
            }
            return;
          }

          const currentSrc = `${baseImagePath}.${extensions[index]}?t=${new Date().getTime()}`;
          const tempImg = new Image();
          tempImg.onload = () => {
            imageFound = true;
            nequiQR.src = currentSrc; // Asigna la URL que sí funcionó.
          };
          tempImg.onerror = () => tryExtension(index + 1); // Si falla, intenta con la siguiente extensión.
          tempImg.src = currentSrc;
        };

        tryExtension(0); // Inicia el proceso de búsqueda.
      }
    });
  }

  // Lógica para actualizar el monto de Nequi
  if (nequiPackageSelect && nequiAmountDisplay) {
    nequiPackageSelect.addEventListener('change', () => {
      const amount = nequiPackageSelect.value;
      // Formateamos el número para que tenga separadores de miles
      const formattedAmount = new Intl.NumberFormat('es-CO').format(amount);
      const displayStrongTag = nequiAmountDisplay.querySelector('strong');
      if (displayStrongTag) displayStrongTag.textContent = `$${formattedAmount} COP`;
    });
  }

  // Botones para volver atrás en el modal
  const backButtons = document.querySelectorAll('.gta-boton-atras');

  const goBackToPaymentSelection = () => {
    paymentMethodStep.hidden = false;
    paypalStep.hidden = true;
    nequiStep.hidden = true;
    // Limpia el contenedor de botones de PayPal para evitar errores si se vuelve a entrar
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = '';
    }
  };

  backButtons.forEach(button => button.addEventListener('click', goBackToPaymentSelection));

  // Cerrar el modal
  const closeModal = () => {
    const purchaseForm = document.getElementById('purchase-form');
    // Limpia el campo de usuario también al cerrar
    if (purchaseForm) purchaseForm.reset();
    if (purchaseModal) purchaseModal.hidden = true;
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (purchaseModal) {
    purchaseModal.addEventListener('click', (e) => {
      if (e.target === purchaseModal) closeModal(); // Cierra si se hace clic en el fondo
    });
  }

  // Función para renderizar el botón de PayPal
  function renderPayPalButton() {
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    // Limpia el contenedor antes de renderizar para evitar duplicados
    if (!paypalButtonContainer) return console.warn('Contenedor de PayPal no encontrado.');
    paypalButtonContainer.innerHTML = '';

    if (typeof paypal === 'undefined') {
      console.error('El SDK de PayPal no se ha cargado. Revisa tu Client ID en index.html.');
      paypalButtonContainer.innerHTML = '<p style="color: #FF8C00;">Error al cargar PayPal. Revisa la configuración del Client ID.</p>';
      return;
    }

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: function(data, actions) {
        if (!sampUsernameInput) {
          throw new Error('Elementos del formulario no encontrados.');
        }
        const username = sampUsernameInput.value.trim();
        if (!username) {
          showToast('Por favor, introduce tu nombre de usuario de SA-MP.');
          // Evita que la orden se cree si el nombre de usuario está vacío
          throw new Error('Nombre de usuario de SA-MP requerido.');
        }

        let amount;
        let itemName;

        if (currentPurchase === 'house') {
          amount = '6.00';
          itemName = 'Casa Privada';
        } else { // 'coins'
          const selectedOption = coinPackageSelect.options[coinPackageSelect.selectedIndex];
          amount = selectedOption.value;
          itemName = selectedOption.dataset.name;
        }

        showToast(`Creando orden para ${itemName} (${username})...`);

        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount
            },
            description: `${itemName} para SA-MP usuario: ${username}`,
            custom_id: username // Usamos custom_id para pasar el nombre de usuario
          }]
        });
      },
      onApprove: function(data, actions) {
        showToast('Procesando pago...');
        return actions.order.capture().then(function(details) {
          // --- PAGO EXITOSO ---
          showToast(`¡Pago completado por ${details.payer.name.given_name}! Redirigiendo...`);

          const username = sampUsernameInput.value.trim();
          const amount = details.purchase_units[0].amount.value;
          const currency = details.purchase_units[0].amount.currency_code;
          const transactionDate = details.update_time;

          let itemName;
          if (currentPurchase === 'house') {
            itemName = 'Casa Privada';
          } else {
            const selectedOption = coinPackageSelect.options[coinPackageSelect.selectedIndex];
            itemName = selectedOption.dataset.name;
          }

          window.location.href = `pago-exitoso.html?username=${encodeURIComponent(username)}&itemName=${encodeURIComponent(itemName)}&amount=${amount}&currency=${currency}&date=${transactionDate}&orderID=${data.orderID}`;
        }).catch(function(error) {
          // --- PAGO FALLIDO (EJ. FONDOS INSUFICIENTES) ---
          console.error('Error al capturar el pago:', error);

          const username = sampUsernameInput.value.trim();
          let itemName;
          let amount;
          if (currentPurchase === 'house') {
            itemName = 'Casa Privada';
            amount = '6.00';
          } else {
            const selectedOption = coinPackageSelect.options[coinPackageSelect.selectedIndex];
            itemName = selectedOption.dataset.name;
            amount = selectedOption.value;
          }
          const currency = 'USD'; // Moneda base de la configuración de PayPal

          let reason = 'error_pago';
          // Detecta si el pago fue declinado (la causa más común de fondos insuficientes)
          if (error.message && error.message.includes('INSTRUMENT_DECLINED')) {
            reason = 'fondos_insuficientes';
          }

          window.location.href = `pago-fallido.html?reason=${reason}&username=${encodeURIComponent(username)}&itemName=${encodeURIComponent(itemName)}&amount=${amount}&currency=${currency}`;
        });
      },
      onCancel: function(data) {
        const username = sampUsernameInput.value.trim();
        let itemName;
        let amount;
        if (currentPurchase === 'house') {
          itemName = 'Casa Privada';
          amount = '6.00';
        } else {
          const selectedOption = coinPackageSelect.options[coinPackageSelect.selectedIndex];
          itemName = selectedOption.dataset.name;
          amount = selectedOption.value;
        }
        const currency = 'USD';
        // Redirige a la página de pago fallido si el usuario cancela, incluyendo los datos del intento
        window.location.href = `pago-fallido.html?reason=cancelado&username=${encodeURIComponent(username)}&itemName=${encodeURIComponent(itemName)}&amount=${amount}&currency=${currency}`;
      },
      onError: function(err) {
        console.error('Error durante el pago:', err);
        // Redirige a la página de pago fallido si hay un error general
        window.location.href = `pago-fallido.html?reason=error`;
      }
    }).render('#paypal-button-container'); // Renderiza el botón en el div
  }


  // Lógica para los botones de compra por Discord
  document.querySelectorAll('.gta-boton-discord').forEach(boton => {
    boton.addEventListener('click', () => window.open('https://discord.gg/EsgBcUCubQ', '_blank'));
  });


  // Formulario de reclamos
  const form = document.getElementById('form-reclamos');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevenimos el envío tradicional

      const nombre = form.querySelector('#nombre');
      const correo = form.querySelector('#correo');
      const mensaje = form.querySelector('#mensaje');
      const submitButton = form.querySelector('button[type="submit"]');

      if (!nombre.value.trim() || !correo.value.trim() || !mensaje.value.trim()) {
        showToast('Por favor completa todos los campos.');
        return;
      }

      playClickSound();
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          showToast('¡Reclamo enviado! El equipo de Creativos RP revisará tu caso pronto.');
          form.reset();
        } else {
          showToast('Hubo un error al enviar el reclamo. Inténtalo de nuevo.');
        }
      } catch (error) {
        showToast('Hubo un error de red. Por favor, revisa tu conexión.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar';
      }
    });
  }

  // Año dinámico en footer
  const anioEl = document.getElementById('anio');
  if (anioEl) anioEl.textContent = new Date().getFullYear();
});
