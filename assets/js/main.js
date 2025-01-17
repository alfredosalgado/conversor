const inputMonto = document.querySelector('#input-monto');
const selectMoneda = document.querySelector('#select-moneda');
const btnConvertir = document.querySelector('#btn-convertir');
const resultado = document.querySelector('#resultado');
const canvasGrafico = document.querySelector('#grafico-historial');

// Variable para almacenar las tasas de conversion
// Definido en base a la estructura del desafio
let tasasConversion = {};

// Variable para almacenar la instancia del grafico
let chartInstance;

// Función genérica para realizar solicitudes a la API
const fetchApiData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

// Función principal para inicializar datos y manejar conversiones
const main = async () => {
  try {
    // Obtener tasas de conversion
    const data = await fetchApiData('https://mindicador.cl/api');
    tasasConversion = {
      dolar: data.dolar.valor, // Tasa de conversion para el dolar
      euro: data.euro.valor   // Tasa de conversion para el euro
    };

    // Agregar evento al boton de convertir
    btnConvertir.addEventListener('click', async () => {
      const monto = inputMonto.value;
      const moneda = selectMoneda.value;

      if (isNaN(monto) || !moneda || monto <= 0) {
        resultado.innerHTML = 'Por favor, ingrese un monto válido y seleccione una moneda.';
        return;
      }

      // Obtener la tasa de conversion correspondiente
      const tasa = tasasConversion[moneda];

      if (!tasa) {
        resultado.innerHTML = 'No se pudo realizar la conversión. Verifique los datos ingresados.';
        return;
      }

      // Realizar la conversion y mostrar el resultado
      const montoConvertido = (monto / tasa).toFixed(2);
      resultado.innerHTML = `El monto convertido es ${montoConvertido} ${moneda.toUpperCase()}.`;

      // Obtener y mostrar el historial de los últimos 10 dias
      const historialData = await fetchApiData(`https://mindicador.cl/api/${moneda}`);
      const valores = historialData.serie.slice(0, 10).map(item => item.valor); // Últimos 10 días
      const fechas = historialData.serie.slice(0, 10).map(item => new Date(item.fecha).toLocaleDateString()); // Formatear fechas

      // Destruir grafico existente si ya está inicializado
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Renderizar el grafico usando Chart.js
      chartInstance = new Chart(canvasGrafico, {
        type: 'line',
        data: {
          labels: fechas.reverse(), // Fechas en orden cronológico
          datasets: [{
            label: `Historial de ${moneda.toUpperCase()} (últimos 10 días)`,
            data: valores.reverse(),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            }
          }
        }
      });
    });
  } catch (error) {
    console.error('Error general en la aplicación:', error);
    resultado.innerHTML = 'Error al inicializar la aplicación. Intente nuevamente más tarde.';
  }
};

// Llamar a la funcion principal al cargar la pagina
main();
