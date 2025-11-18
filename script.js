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

  // Carga inteligente de la imagen de fondo para mejorar el rendimiento
  const bgElement = document.getElementById('gta-bg');
  if (bgElement) {
    const bgImageUrl = 'https://wallpaperaccess.in/public/uploads/preview/cool-gta-san-andreas-wallpaper-1920x1080.jpg';
    bgElement.style.backgroundImage = `url(${bgImageUrl})`;
    bgElement.style.opacity = '0.4';
  }

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
    // Usamos toggle para añadir/quitar la clase 'active'
    const isActive = navbar.classList.toggle('active'); 
    // Si el menú se está abriendo, aseguramos que esté visible para la transición
    if (isActive) navbar.style.display = 'flex'; else setTimeout(() => navbar.style.display = 'none', 300); // Espera a que termine la transición para ocultar completamente
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
      navbar.classList.remove('active'); // Elimina la clase 'active'
      if (menuButton) {
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ===============================================
  // 2.5. OCULTAR HEADER AL HACER SCROLL
  // ===============================================
  const header = document.querySelector('.gta-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
      // Scrolling down
      header.classList.add('header-hidden');
      // También cierra el menú si está abierto para evitar que quede flotando
      if (navbar && navbar.classList.contains('active')) { // Añadido 'navbar &&' para seguridad
        toggleMenu();
      }
    } else {
      // Scrolling up
      header.classList.remove('header-hidden');
    }
    lastScrollY = currentScrollY;
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
  const buyEmpresaBtn = document.getElementById('buy-empresa-btn');
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

  // Limpia el resaltado de error al escribir en el campo de usuario de la tienda
  if (sampUsernameInput) {
    sampUsernameInput.addEventListener('input', () => {
      if (sampUsernameInput.classList.contains('gta-input-error')) {
        sampUsernameInput.classList.remove('gta-input-error');
      }
    });
  }

  // Botones de selección
  const selectPaypalBtn = document.getElementById('select-paypal-btn');
  const selectCardBtn = document.getElementById('select-card-btn');
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
      else if (purchaseType === 'empresa') {
        modalTitle.textContent = 'Comprar Empresa';
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

  if (buyEmpresaBtn) {
    buyEmpresaBtn.addEventListener('click', () => openModal('empresa'));
  }

  if (buyHouseBtn) {
    buyHouseBtn.addEventListener('click', () => openModal('house'));
  }

  // Lógica de selección de método
  if (selectPaypalBtn) {
    selectPaypalBtn.addEventListener('click', () => {
      paymentMethodStep.hidden = true;
      paypalStep.hidden = false;
      renderPayPalButton(paypal.FUNDING.PAYPAL); // Muestra solo el botón de PayPal
    });
  }

  // Lógica para el botón de Tarjeta de Débito/Crédito
  if (selectCardBtn) {
    selectCardBtn.addEventListener('click', () => {
      paymentMethodStep.hidden = true;
      paypalStep.hidden = false;
      renderPayPalButton(paypal.FUNDING.CARD); // Muestra solo el botón de Tarjeta
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
      } else if (currentPurchase === 'empresa') {
        const empresaPriceCOP = 60000; // $15 USD a COP (aprox)
        const formattedAmount = new Intl.NumberFormat('es-CO').format(empresaPriceCOP);
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
    if (sampUsernameInput) sampUsernameInput.classList.remove('gta-input-error');
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
  function renderPayPalButton(fundingSource) {
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    // Limpia el contenedor antes de renderizar para evitar duplicados
    if (!paypalButtonContainer) return console.warn('Contenedor de PayPal no encontrado.');
    paypalButtonContainer.innerHTML = '';

    if (typeof paypal === 'undefined') {
      console.error('El SDK de PayPal no se ha cargado. Revisa tu Client ID en index.html.');
      paypalButtonContainer.innerHTML = '<p style="color: #FF8C00;">Error al cargar PayPal. Revisa la configuración del Client ID.</p>';
      return;
    }

    const isCard = fundingSource === paypal.FUNDING.CARD;

    paypal.Buttons({
      fundingSource: fundingSource, // Aquí está la clave: especifica qué botón renderizar
      disableFunding: isCard ? 'paypal' : 'card', // Deshabilita la otra opción para evitar confusiones
      style: {
        layout: 'vertical',
        color:  isCard ? 'black' : 'gold', // Negro para tarjeta, dorado para PayPal
        shape: 'rect',
        label: isCard ? 'pay' : 'paypal', // 'Pagar' para tarjeta, 'PayPal' para el otro
        tagline: false // Opcional: quitar el tagline para un look más limpio
      },
      onClick: function(data, actions) {
        const username = sampUsernameInput.value.trim();
        if (!username) {
          showToast('Por favor, introduce tu nombre de usuario de SA-MP.');
          highlightError(sampUsernameInput);
          sampUsernameInput.focus();
          return actions.reject();
        }
        // Validación del formato Nombre_Apellido
        const usernameRegex = /^[a-zA-Z0-9]+_[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(username)) {
          showToast('El formato debe ser Nombre_Apellido, con texto antes y después del guion bajo.');
          highlightError(sampUsernameInput);
          sampUsernameInput.focus();
          return actions.reject();
        }
        return actions.resolve();
      },
      createOrder: function(data, actions) {
        const username = sampUsernameInput.value.trim();

        let amount;
        let itemName;

        if (currentPurchase === 'house') {
          amount = '6.00';
          itemName = 'Casa Privada';
        } else if (currentPurchase === 'empresa') {
          amount = '15.00';
          itemName = 'Empresa';
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
          } else if (currentPurchase === 'empresa') {
            itemName = 'Empresa';
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
          } else if (currentPurchase === 'empresa') {
            itemName = 'Empresa';
            amount = '15.00';
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
        } else if (currentPurchase === 'empresa') {
          itemName = 'Empresa';
          amount = '15.00';
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
    })
    .render('#paypal-button-container')
    .catch((err) => {
      console.error('Error al renderizar botones de PayPal:', err);
      let errorMessage = 'Error al inicializar el método de pago.';
      if (fundingSource === paypal.FUNDING.CARD) {
        errorMessage += ' Asegúrate de que tu cuenta de PayPal Business tenga activados los pagos avanzados con tarjeta.';
      }
      paypalButtonContainer.innerHTML = `<p style="color: #FF8C00;">${errorMessage}</p>`;
    });
  }


  // Lógica para los botones de compra por Discord
  document.querySelectorAll('.gta-boton-discord').forEach(boton => {
    boton.addEventListener('click', () => window.open('https://discord.gg/EsgBcUCubQ', '_blank'));
  });

  // ===============================================
  // 8. LÓGICA DE SUBIDA DE IMAGEN PARA RECLAMOS
  // ===============================================
  const imageInput = document.getElementById('imagen-reclamo');
  const uploadStatus = document.getElementById('upload-status');
  const hiddenImageLink = document.getElementById('enlace-imagen-oculto');
  const uploadProgressBar = document.getElementById('upload-progress');
  const uploadPercentage = document.getElementById('upload-percentage');
  const progressContainer = document.getElementById('progress-container');

  if (imageInput && uploadStatus && hiddenImageLink) {
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // 🛑 IMPORTANTE: Reemplaza con tu propia API Key de imgbb.com
      const apiKey = '25f49b817e22362e4296cda5eb2f18b9';

      if (apiKey === 'TU_API_KEY_DE_IMGBB' || !apiKey) {
        showToast('Error: La subida de imágenes no está configurada.');
        console.error("Por favor, añade tu API Key de imgbb.com en script.js");
        return;
      }

      // Mostrar barra de progreso y estado
      uploadStatus.textContent = 'Subiendo imagen...';
      progressContainer.style.display = 'flex';
      uploadProgressBar.value = 0;
      uploadPercentage.textContent = '0%';
      hiddenImageLink.value = ''; // Limpia el valor anterior

      const formData = new FormData();
      formData.append('image', file);

      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.imgbb.com/1/upload?key=${apiKey}`);

        // Evento de progreso de subida
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            uploadProgressBar.value = percent;
            uploadPercentage.textContent = `${percent}%`;
          }
        });

        // Cuando la solicitud se completa
        xhr.onload = () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              hiddenImageLink.value = result.data.url;
              uploadStatus.textContent = '✅ Imagen adjuntada con éxito.';
              uploadProgressBar.value = 100;
              uploadPercentage.textContent = '100%';
            } else {
              uploadStatus.textContent = `❌ Error al subir la imagen: ${result.error.message || 'Desconocido'}`;
              progressContainer.style.display = 'none';
            }
          } else {
            uploadStatus.textContent = `❌ Error al subir la imagen. Código: ${xhr.status}`;
            progressContainer.style.display = 'none';
          }
        };

        // Cuando ocurre un error de red
        xhr.onerror = () => {
          uploadStatus.textContent = '❌ Error de red al subir la imagen.';
          progressContainer.style.display = 'none';
        };

        xhr.send(formData);
      } catch (error) {
        uploadStatus.textContent = '❌ Error de red al subir la imagen.';
        progressContainer.style.display = 'none';
      }
    });
  }

  // Función reutilizable para resaltar errores
  const highlightError = (element) => {
    element.classList.add('gta-input-error');
    element.addEventListener('input', () => element.classList.remove('gta-input-error'), { once: true });
  };

  // Formulario de reclamos
  const form = document.getElementById('form-reclamos');
  if (form) {
    // Rellena el último nombre de usuario utilizado desde localStorage
    const nombreInput = form.querySelector('#nombre');
    const ultimoNombre = localStorage.getItem('ultimoNombreReclamo');
    if (nombreInput && ultimoNombre) {
      nombreInput.value = ultimoNombre;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevenimos el envío tradicional


      const nombre = form.querySelector('#nombre');
      const correo = form.querySelector('#correo');
      const mensaje = form.querySelector('#mensaje');
      const discord = form.querySelector('#discord');
      const submitButton = form.querySelector('button[type="submit"]');

      // Limpia errores previos
      form.querySelectorAll('.gta-input-error').forEach(el => el.classList.remove('gta-input-error'));

      // Validación: nombre, correo, discord y mensaje son obligatorios. La imagen es opcional.
      if (!nombre.value.trim() || !correo.value.trim() || !mensaje.value.trim() || !discord.value.trim()) {
        showToast('Por favor completa todos los campos obligatorios.');
        [nombre, correo, mensaje, discord].forEach(el => {
          if (!el.value.trim()) highlightError(el);
        });
        return;
      }

      // Validación del formato Nombre_Apellido
      if (!nombre.value.trim().includes('_')) {
        showToast('El formato del nombre debe ser Nombre_Apellido.');
        highlightError(nombre);
        return;
      }


      // Validación del formato de usuario de Discord
      const discordValue = discord.value.trim();
      let isDiscordValid = false;
      if (discordValue.includes('#')) {
        // Formato antiguo: Nombre#1234
        isDiscordValid = /^.{2,32}#\d{4}$/.test(discordValue);
      } else {
        // Formato nuevo: sin # (entre 2 y 32 caracteres)
        isDiscordValid = discordValue.length >= 2 && discordValue.length <= 32;
      }

      if (!isDiscordValid) {
        showToast('Por favor, introduce un usuario de Discord válido.');
        highlightError(discord);
        return;
      }

      // Validación de número mínimo de palabras en el mensaje
      const minPalabras = 10;
      const palabras = mensaje.value.trim().split(/\s+/).filter(p => p.length > 0).length;
      if (palabras < minPalabras) {
        showToast(`La descripción del reclamo debe tener al menos ${minPalabras} palabras.`);
        highlightError(mensaje);
        return;
      }

      playClickSound();
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';


      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
              'Accept': 'application/json'
          }
        });

        if (response.ok) {

          const nombreGuardar = nombre.value.trim();
          localStorage.setItem('ultimoNombreReclamo', nombreGuardar); // Guarda el nombre

          showToast('¡Reclamo enviado! El equipo de Creativos RP revisará tu caso pronto.');
          form.reset();

          nombre.value = nombreGuardar; // Restaura el nombre en el campo después de resetear

          // Resetea también el estado de la subida de imagen
          if (uploadStatus) {
            uploadStatus.textContent = '';
            progressContainer.style.display = 'none';
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido.' }));
          showToast(`Error al enviar el reclamo: ${errorData.message || 'Inténtalo de nuevo.'} Por favor, verifica tu configuración en Formspree.`);
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
