// =====================================================
// BOTÓN SIMULAR
// =====================================================

const btnSimular =
    document.getElementById("btnSimular");


// =====================================================
// VARIABLES GLOBALES
// =====================================================

let resultadoSimulacion = null;

let tiempoActual = 0;

let intervaloAnimacion = null;

let reproduciendo = false;


// =====================================================
// BOTÓN SIMULAR
// =====================================================

btnSimular.addEventListener(
    "click",
    () => {

        const alturaInicial =
            parseFloat(
                document.getElementById(
                    "alturaInicial"
                ).value
            );

        const velocidadInicial =
            parseFloat(
                document.getElementById(
                    "velocidadInicial"
                ).value
            );

        const gravedad =
            parseFloat(
                document.getElementById(
                    "gravedad"
                ).value
            );

        const tiempoTotal =
            parseFloat(
                document.getElementById(
                    "tiempoTotal"
                ).value
            );


        // =============================================
        // VALIDACIONES
        // =============================================

        if (
            isNaN(alturaInicial) ||
            isNaN(velocidadInicial) ||
            isNaN(gravedad) ||
            isNaN(tiempoTotal)
        ) {

            alert(
                "Por favor, completa todos los parámetros."
            );

            return;

        }


        if (alturaInicial <= 0) {

            alert(
                "La altura inicial debe ser mayor que 0."
            );

            return;

        }


        if (gravedad <= 0) {

            alert(
                "La gravedad debe ser mayor que 0."
            );

            return;

        }


        if (tiempoTotal <= 0) {

            alert(
                "El tiempo de simulación debe ser mayor que 0."
            );

            return;

        }


        try {

            const resultado =
                calcularSimulacion(
                    alturaInicial,
                    velocidadInicial,
                    gravedad,
                    tiempoTotal
                );


            // =========================================
            // GUARDAR RESULTADO
            // =========================================

            resultadoSimulacion =
                resultado;


            tiempoActual = 0;


            detenerAnimacion();


            // =========================================
            // CREAR INTERFAZ
            // =========================================

            crearInterfazSimulacion();


            // =========================================
            // CREAR GRÁFICAS
            // =========================================

            crearGraficas();


            // =========================================
            // ESTADO INICIAL
            // =========================================

            actualizarSimulacion(0);

        }


        catch (error) {

            console.error(
                "Error:",
                error
            );


            document.getElementById(
                "resultado"
            ).innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ⚠
                    </div>

                    <h3>
                        Error en la simulación
                    </h3>

                    <p>
                        Ocurrió un error al calcular la simulación.
                    </p>

                </div>

            `;

        }

    }
);


// =====================================================
// CALCULAR SIMULACIÓN (FÍSICA EN EL CLIENTE)
// =====================================================

function calcularSimulacion(
    alturaInicial,
    velocidadInicial,
    gravedad,
    tiempoTotal
) {

    const cantidadPuntos = 200;


    // =================================================
    // TIEMPO DE IMPACTO
    //
    // y = y0 + v0*t - 1/2*g*t²
    //
    // Resolviendo y = 0 con la fórmula cuadrática:
    //
    // t = (v0 + sqrt(v0² + 2*g*h)) / g
    // =================================================

    const discriminante =
        velocidadInicial ** 2 +
        2 * gravedad * alturaInicial;

    const tiempoImpacto =
        (velocidadInicial + Math.sqrt(discriminante)) /
        gravedad;


    // =================================================
    // ALTURA MÁXIMA
    // =================================================

    let tiempoAlturaMaxima;
    let alturaMaxima;

    if (velocidadInicial > 0) {

        tiempoAlturaMaxima =
            velocidadInicial / gravedad;

        alturaMaxima =
            alturaInicial +
            velocidadInicial * tiempoAlturaMaxima -
            0.5 * gravedad * tiempoAlturaMaxima ** 2;

    }
    else {

        tiempoAlturaMaxima = 0;

        alturaMaxima = alturaInicial;

    }


    // =================================================
    // VELOCIDAD DE IMPACTO
    // =================================================

    const velocidadImpacto =
        velocidadInicial - gravedad * tiempoImpacto;


    // =================================================
    // TIEMPO FINAL
    //
    // La simulación nunca debe continuar después
    // de que el objeto llegue al suelo.
    // =================================================

    const tiempoFinal =
        Math.min(
            tiempoTotal,
            tiempoImpacto
        );


    // =================================================
    // GENERAR TIEMPOS
    // =================================================

    const tiempos = [];

    const paso =
        tiempoFinal / (cantidadPuntos - 1);

    for (
        let i = 0;
        i < cantidadPuntos;
        i++
    ) {

        tiempos.push(i * paso);

    }


    // =================================================
    // ECUACIONES DE MOVIMIENTO
    // =================================================

    const posicion =
        tiempos.map(
            (t) => {

                return (
                    alturaInicial +
                    velocidadInicial * t -
                    0.5 * gravedad * t ** 2
                );

            }
        );

    const velocidad =
        tiempos.map(
            (t) => velocidadInicial - gravedad * t
        );

    const aceleracion =
        tiempos.map(
            () => -gravedad
        );


    // =================================================
    // FORZAR ÚLTIMO PUNTO AL SUELO
    // =================================================

    if (tiempoFinal === tiempoImpacto) {

        posicion[cantidadPuntos - 1] = 0;

        velocidad[cantidadPuntos - 1] = velocidadImpacto;

    }


    // =================================================
    // RESULTADO
    // =================================================

    return {

        "tiempo": tiempos,

        "posicion": posicion,

        "velocidad": velocidad,

        "aceleracion": aceleracion,

        "tiempo_impacto": tiempoImpacto,

        "velocidad_impacto": velocidadImpacto,

        "altura_maxima": alturaMaxima,

        "tiempo_altura_maxima": tiempoAlturaMaxima

    };

}


// =====================================================
// CREAR INTERFAZ DE SIMULACIÓN
// =====================================================

function crearInterfazSimulacion() {

    const tiempoTotal =
        resultadoSimulacion.tiempo[
            resultadoSimulacion.tiempo.length - 1
        ];


    document.getElementById(
        "resultado"
    ).innerHTML = `


        <!-- =========================================
             CONTROL
             ========================================= -->

        <div class="control-simulacion">


            <div class="control-header">

                <div>

                    <span class="tag">
                        SIMULACIÓN
                    </span>


                    <h2>
                        Control de movimiento
                    </h2>


                    <p>
                        Controla el instante de tiempo
                        y observa cómo cambia el movimiento.
                    </p>

                </div>

            </div>


            <!-- =====================================
                 BOTONES
                 ===================================== -->

            <div class="controles">


                <button
                    id="btnRetroceder"
                    class="control-btn"
                    title="Retroceder"
                >
                    ◀◀
                </button>


                <button
                    id="btnPlay"
                    class="control-btn control-principal"
                    title="Reproducir"
                >
                    ▶
                </button>


                <button
                    id="btnAvanzar"
                    class="control-btn"
                    title="Avanzar"
                >
                    ▶▶
                </button>


                <button
                    id="btnReiniciar"
                    class="control-btn"
                    title="Reiniciar"
                >
                    ↻
                </button>


            </div>


            <!-- =====================================
                 SLIDER
                 ===================================== -->

            <div class="tiempo-control">


                <div class="tiempo-labels">

                    <span>
                        0.00 s
                    </span>


                    <strong id="tiempoSliderTexto">
                        0.00 s
                    </strong>


                    <span>
                        ${tiempoTotal.toFixed(2)} s
                    </span>

                </div>


                <input
                    type="range"
                    id="sliderTiempo"
                    min="0"
                    max="${tiempoTotal}"
                    step="0.01"
                    value="0"
                >


            </div>


            <!-- =====================================
                 DATOS
                 ===================================== -->

            <div class="datos-tiempo">


                <div class="dato-tiempo">

                    <span>
                        Tiempo
                    </span>


                    <strong id="valorTiempo">
                        0.00 s
                    </strong>

                </div>


                <div class="dato-tiempo">

                    <span>
                        Posición
                    </span>


                    <strong id="valorPosicion">
                        0.00 m
                    </strong>

                </div>


                <div class="dato-tiempo">

                    <span>
                        Velocidad
                    </span>


                    <strong id="valorVelocidad">
                        0.00 m/s
                    </strong>

                </div>


                <div class="dato-tiempo">

                    <span>
                        Aceleración
                    </span>


                    <strong id="valorAceleracion">
                        0.00 m/s²
                    </strong>

                </div>


            </div>


        </div>


        <!-- =========================================
             ESCENARIO FÍSICO
             ========================================= -->

        <div id="escenarioFisico">


            <div class="escenario-header">


                <div>

                    <span class="tag">
                        VISUALIZACIÓN
                    </span>


                    <h2>
                        Movimiento del objeto
                    </h2>


                    <p>
                        Representación visual del movimiento vertical.
                    </p>

                </div>


            </div>


            <div class="escenario">


                <div class="altura-marcador">

                    <span id="alturaVisual">
                        0.00 m
                    </span>

                </div>


                <div
                    id="objeto"
                    class="objeto"
                >
                </div>


                <div class="suelo">


                    <div
                        class="suelo-linea"
                    ></div>


                    <span>
                        SUELO
                    </span>


                </div>


            </div>


        </div>


        <!-- =========================================
             GRÁFICAS
             ========================================= -->

        <div id="contenedorGraficas"></div>

    `;


    // =================================================
    // SLIDER
    // =================================================

    document
        .getElementById(
            "sliderTiempo"
        )
        .addEventListener(
            "input",
            (evento) => {

                detenerAnimacion();


                tiempoActual =
                    parseFloat(
                        evento.target.value
                    );


                actualizarSimulacion(
                    tiempoActual
                );

            }
        );


    // =================================================
    // PLAY GENERAL
    // =================================================

    document
        .getElementById(
            "btnPlay"
        )
        .addEventListener(
            "click",
            () => {

                if (reproduciendo) {

                    detenerAnimacion();

                }

                else {

                    iniciarAnimacion();

                }

            }
        );


    // =================================================
    // REINICIAR
    // =================================================

    document
        .getElementById(
            "btnReiniciar"
        )
        .addEventListener(
            "click",
            () => {

                detenerAnimacion();

                tiempoActual = 0;

                actualizarSimulacion(
                    0
                );

            }
        );


    // =================================================
    // AVANZAR
    // =================================================

    document
        .getElementById(
            "btnAvanzar"
        )
        .addEventListener(
            "click",
            () => {

                detenerAnimacion();

                tiempoActual += 0.1;


                const tiempoMaximo =
                    resultadoSimulacion.tiempo[
                        resultadoSimulacion.tiempo.length - 1
                    ];


                if (
                    tiempoActual >
                    tiempoMaximo
                ) {

                    tiempoActual =
                        tiempoMaximo;

                }


                actualizarSimulacion(
                    tiempoActual
                );

            }
        );


    // =================================================
    // RETROCEDER
    // =================================================

    document
        .getElementById(
            "btnRetroceder"
        )
        .addEventListener(
            "click",
            () => {

                detenerAnimacion();

                tiempoActual -= 0.1;


                if (
                    tiempoActual < 0
                ) {

                    tiempoActual = 0;

                }


                actualizarSimulacion(
                    tiempoActual
                );

            }
        );

}


// =====================================================
// CREAR GRÁFICAS
// =====================================================

function crearGraficas() {

    document.getElementById(
        "contenedorGraficas"
    ).innerHTML = `


        <div class="graficas">


            <!-- =====================================
                 POSICIÓN
                 ===================================== -->

            <div class="grafica-card">

                <div class="grafica-header">

                    <span class="tag">
                        GRÁFICA 01
                    </span>


                    <h3>
                        Posición vs. Tiempo
                    </h3>


                    <p>
                        y(t)
                    </p>


                    <!-- BOTÓN PLAY POSICIÓN -->

                    <button
                        id="btnPlayPosicion"
                        class="btn-grafica-play"
                        type="button"
                    >
                        ▶ Reproducir
                    </button>

                </div>


                <div
                    id="graficaPosicion"
                    class="grafica"
                ></div>

            </div>



            <!-- =====================================
                 VELOCIDAD
                 ===================================== -->

            <div class="grafica-card">

                <div class="grafica-header">

                    <span class="tag">
                        GRÁFICA 02
                    </span>


                    <h3>
                        Velocidad vs. Tiempo
                    </h3>


                    <p>
                        v(t)
                    </p>


                    <!-- BOTÓN PLAY VELOCIDAD -->

                    <button
                        id="btnPlayVelocidad"
                        class="btn-grafica-play"
                        type="button"
                    >
                        ▶ Reproducir
                    </button>

                </div>


                <div
                    id="graficaVelocidad"
                    class="grafica"
                ></div>

            </div>



            <!-- =====================================
                 ACELERACIÓN
                 ===================================== -->

            <div class="grafica-card">

                <div class="grafica-header">

                    <span class="tag">
                        GRÁFICA 03
                    </span>


                    <h3>
                        Aceleración vs. Tiempo
                    </h3>


                    <p>
                        a(t)
                    </p>


                    <!-- BOTÓN PLAY ACELERACIÓN -->

                    <button
                        id="btnPlayAceleracion"
                        class="btn-grafica-play"
                        type="button"
                    >
                        ▶ Reproducir
                    </button>

                </div>


                <div
                    id="graficaAceleracion"
                    class="grafica"
                ></div>

            </div>


        </div>

    `;


    // =================================================
    // CONFIGURACIÓN
    // =================================================

    const configuracion = {

        responsive: true,

        displayModeBar: false

    };


    // =================================================
    // POSICIÓN
    // =================================================

    Plotly.newPlot(

        "graficaPosicion",

        [{

            x:
                resultadoSimulacion.tiempo,

            y:
                resultadoSimulacion.posicion,

            mode:
                "lines",

            name:
                "Posición",

            line: {

                width: 3

            },

            hovertemplate:

                "Tiempo: %{x:.2f} s<br>" +

                "Posición: %{y:.2f} m" +

                "<extra></extra>"

        }],

        {

            title: {

                text:
                    "Posición del objeto",

                font: {

                    size: 18

                }

            },

            xaxis: {

                title:
                    "Tiempo (s)",

                zeroline:
                    true

            },

            yaxis: {

                title:
                    "Posición (m)",

                zeroline:
                    true

            },

            margin: {

                l: 65,

                r: 30,

                t: 60,

                b: 60

            }

        },

        configuracion

    );


    // =================================================
    // VELOCIDAD
    // =================================================

    Plotly.newPlot(

        "graficaVelocidad",

        [{

            x:
                resultadoSimulacion.tiempo,

            y:
                resultadoSimulacion.velocidad,

            mode:
                "lines",

            name:
                "Velocidad",

            line: {

                width: 3

            },

            hovertemplate:

                "Tiempo: %{x:.2f} s<br>" +

                "Velocidad: %{y:.2f} m/s" +

                "<extra></extra>"

        }],

        {

            title: {

                text:
                    "Velocidad del objeto",

                font: {

                    size: 18

                }

            },

            xaxis: {

                title:
                    "Tiempo (s)",

                zeroline:
                    true

            },

            yaxis: {

                title:
                    "Velocidad (m/s)",

                zeroline:
                    true

            },

            margin: {

                l: 65,

                r: 30,

                t: 60,

                b: 60

            }

        },

        configuracion

    );


    // =================================================
    // ACELERACIÓN
    // =================================================

    Plotly.newPlot(

        "graficaAceleracion",

        [{

            x:
                resultadoSimulacion.tiempo,

            y:
                resultadoSimulacion.aceleracion,

            mode:
                "lines",

            name:
                "Aceleración",

            line: {

                width: 3

            },

            hovertemplate:

                "Tiempo: %{x:.2f} s<br>" +

                "Aceleración: %{y:.2f} m/s²" +

                "<extra></extra>"

        }],

        {

            title: {

                text:
                    "Aceleración del objeto",

                font: {

                    size: 18

                }

            },

            xaxis: {

                title:
                    "Tiempo (s)",

                zeroline:
                    true

            },

            yaxis: {

                title:
                    "Aceleración (m/s²)",

                zeroline:
                    true

            },

            margin: {

                l: 65,

                r: 30,

                t: 60,

                b: 60

            }

        },

        configuracion

    );


    // =================================================
    // BOTONES INDIVIDUALES DE GRÁFICAS
    // =================================================

    configurarBotonGrafica(
        "btnPlayPosicion",
        "graficaPosicion"
    );


    configurarBotonGrafica(
        "btnPlayVelocidad",
        "graficaVelocidad"
    );


    configurarBotonGrafica(
        "btnPlayAceleracion",
        "graficaAceleracion"
    );

}


// =====================================================
// CONFIGURAR BOTÓN INDIVIDUAL DE GRÁFICA
// =====================================================

function configurarBotonGrafica(
    idBoton,
    idGrafica
) {

    const boton =
        document.getElementById(
            idBoton
        );


    if (!boton) {

        return;

    }


    let reproduciendoGrafica = false;

    let intervaloGrafica = null;

    let tiempoGrafica = 0;


    boton.addEventListener(
        "click",
        () => {

            // =========================================
            // PAUSAR
            // =========================================

            if (
                reproduciendoGrafica
            ) {

                clearInterval(
                    intervaloGrafica
                );

                intervaloGrafica =
                    null;

                reproduciendoGrafica =
                    false;

                boton.textContent =
                    "▶ Reproducir";

                return;

            }


            // =========================================
            // OBTENER TIEMPO MÁXIMO
            // =========================================

            const tiempos =
                resultadoSimulacion.tiempo;


            const tiempoMaximo =
                tiempos[
                    tiempos.length - 1
                ];


            // =========================================
            // SI YA TERMINÓ, VOLVER AL INICIO
            // =========================================

            if (
                tiempoGrafica >=
                tiempoMaximo
            ) {

                tiempoGrafica = 0;

            }


            reproduciendoGrafica =
                true;


            boton.textContent =
                "❚❚ Pausar";


            // =========================================
            // ANIMACIÓN INDIVIDUAL
            // =========================================

            intervaloGrafica =
                setInterval(
                    () => {

                        tiempoGrafica +=
                            0.02;


                        if (
                            tiempoGrafica >=
                            tiempoMaximo
                        ) {

                            tiempoGrafica =
                                tiempoMaximo;


                            actualizarMarcadorGraficaIndividual(
                                idGrafica,
                                tiempoGrafica
                            );


                            clearInterval(
                                intervaloGrafica
                            );


                            intervaloGrafica =
                                null;


                            reproduciendoGrafica =
                                false;


                            boton.textContent =
                                "▶ Reproducir";


                            return;

                        }


                        actualizarMarcadorGraficaIndividual(
                            idGrafica,
                            tiempoGrafica
                        );

                    },
                    20
                );

        }
    );

}


// =====================================================
// ACTUALIZAR MARCADOR DE UNA GRÁFICA INDIVIDUAL
// =====================================================

function actualizarMarcadorGraficaIndividual(
    idGrafica,
    tiempo
) {

    const tiempos =
        resultadoSimulacion.tiempo;


    // =================================================
    // BUSCAR ÍNDICE MÁS CERCANO
    // =================================================

    let indice = 0;


    let diferenciaMinima =
        Math.abs(
            tiempos[0] - tiempo
        );


    for (
        let i = 1;
        i < tiempos.length;
        i++
    ) {

        const diferencia =
            Math.abs(
                tiempos[i] - tiempo
            );


        if (
            diferencia <
            diferenciaMinima
        ) {

            diferenciaMinima =
                diferencia;

            indice = i;

        }

    }


    const valor =
        obtenerValorGrafica(
            idGrafica,
            indice
        );


    // =================================================
    // MARCADOR
    // =================================================

    Plotly.relayout(

        idGrafica,

        {

            shapes: [

                {

                    type:
                        "line",

                    x0:
                        tiempos[indice],

                    x1:
                        tiempos[indice],

                    y0:
                        0,

                    y1:
                        1,

                    yref:
                        "paper",

                    line: {

                        width:
                            2,

                        dash:
                            "dash"

                    }

                }

            ],


            annotations: [

                {

                    x:
                        tiempos[indice],

                    y:
                        valor,

                    text:
                        `${tiempos[indice].toFixed(2)} s`,

                    showarrow:
                        true,

                    arrowhead:
                        2,

                    ax:
                        0,

                    ay:
                        -35

                }

            ]

        }

    );

}


// =====================================================
// OBTENER VALOR DE LA GRÁFICA
// =====================================================

function obtenerValorGrafica(
    idGrafica,
    indice
) {

    if (
        idGrafica ===
        "graficaPosicion"
    ) {

        return resultadoSimulacion.posicion[
            indice
        ];

    }


    if (
        idGrafica ===
        "graficaVelocidad"
    ) {

        return resultadoSimulacion.velocidad[
            indice
        ];

    }


    if (
        idGrafica ===
        "graficaAceleracion"
    ) {

        return resultadoSimulacion.aceleracion[
            indice
        ];

    }


    return 0;

}


// =====================================================
// ACTUALIZAR SIMULACIÓN GENERAL
// =====================================================

function actualizarSimulacion(
    tiempo
) {

    if (!resultadoSimulacion) {

        return;

    }


    const tiempos =
        resultadoSimulacion.tiempo;


    // =================================================
    // BUSCAR PUNTO MÁS CERCANO
    // =================================================

    let indice = 0;


    let diferenciaMinima =
        Math.abs(
            tiempos[0] - tiempo
        );


    for (
        let i = 1;
        i < tiempos.length;
        i++
    ) {

        const diferencia =
            Math.abs(
                tiempos[i] - tiempo
            );


        if (
            diferencia <
            diferenciaMinima
        ) {

            diferenciaMinima =
                diferencia;

            indice = i;

        }

    }


    // =================================================
    // VALORES
    // =================================================

    const tiempoReal =
        tiempos[indice];


    const posicion =
        resultadoSimulacion.posicion[
            indice
        ];


    const velocidad =
        resultadoSimulacion.velocidad[
            indice
        ];


    const aceleracion =
        resultadoSimulacion.aceleracion[
            indice
        ];


    tiempoActual =
        tiempoReal;


    // =================================================
    // ELEMENTOS HTML
    // =================================================

    const valorTiempo =
        document.getElementById(
            "valorTiempo"
        );


    const valorPosicion =
        document.getElementById(
            "valorPosicion"
        );


    const valorVelocidad =
        document.getElementById(
            "valorVelocidad"
        );


    const valorAceleracion =
        document.getElementById(
            "valorAceleracion"
        );


    const tiempoSliderTexto =
        document.getElementById(
            "tiempoSliderTexto"
        );


    const sliderTiempo =
        document.getElementById(
            "sliderTiempo"
        );


    // =================================================
    // ACTUALIZAR TEXTO
    // =================================================

    if (valorTiempo) {

        valorTiempo.textContent =
            tiempoReal.toFixed(2) +
            " s";

    }


    if (valorPosicion) {

        valorPosicion.textContent =
            posicion.toFixed(2) +
            " m";

    }


    if (valorVelocidad) {

        valorVelocidad.textContent =
            velocidad.toFixed(2) +
            " m/s";

    }


    if (valorAceleracion) {

        valorAceleracion.textContent =
            aceleracion.toFixed(2) +
            " m/s²";

    }


    if (tiempoSliderTexto) {

        tiempoSliderTexto.textContent =
            tiempoReal.toFixed(2) +
            " s";

    }


    if (sliderTiempo) {

        sliderTiempo.value =
            tiempoReal;

    }


    // =================================================
    // ACTUALIZAR PELOTA
    // =================================================

    actualizarObjeto(
        posicion
    );


    // =================================================
    // ACTUALIZAR MARCADORES
    // =================================================

    actualizarMarcador(
        "graficaPosicion",
        tiempoReal,
        posicion
    );


    actualizarMarcador(
        "graficaVelocidad",
        tiempoReal,
        velocidad
    );


    actualizarMarcador(
        "graficaAceleracion",
        tiempoReal,
        aceleracion
    );

}


// =====================================================
// ACTUALIZAR OBJETO FÍSICO
// =====================================================

function actualizarObjeto(
    posicion
) {

    const objeto =
        document.getElementById(
            "objeto"
        );


    const alturaTexto =
        document.getElementById(
            "alturaVisual"
        );


    if (!objeto) {

        return;

    }


    // =================================================
    // ALTURA MÁXIMA
    // =================================================

    const alturaMaxima =
        resultadoSimulacion.altura_maxima;


    // =================================================
    // EVITAR POSICIONES NEGATIVAS
    // =================================================

    const posicionVisual =
        Math.max(
            0,
            posicion
        );


    // =================================================
    // ESCENARIO
    // =================================================

    const escenario =
        document.querySelector(
            ".escenario"
        );


    const suelo =
        document.querySelector(
            ".suelo"
        );


    if (
        !escenario ||
        !suelo
    ) {

        return;

    }


    const alturaEscenario =
        escenario.clientHeight;


    const alturaSuelo =
        suelo.clientHeight;


    // =================================================
    // ALTURA DISPONIBLE
    // =================================================

    const alturaMovimiento =
        alturaEscenario -
        alturaSuelo -
        50;


    // =================================================
    // CONVERTIR ALTURA A PORCENTAJE
    // =================================================

    let porcentaje =
        posicionVisual /
        alturaMaxima;


    porcentaje =
        Math.max(
            0,
            Math.min(
                1,
                porcentaje
            )
        );


    // =================================================
    // POSICIÓN EN PIXELES
    // =================================================

    const posicionY =
        (1 - porcentaje) *
        alturaMovimiento;


    objeto.style.top =
        `${posicionY}px`;


    // =================================================
    // MOSTRAR ALTURA
    // =================================================

    if (alturaTexto) {

        alturaTexto.textContent =
            `${posicionVisual.toFixed(2)} m`;

    }

}


// =====================================================
// MARCADORES DE LAS GRÁFICAS
// =====================================================

function actualizarMarcador(
    grafica,
    tiempo,
    valor
) {

    const elemento =
        document.getElementById(
            grafica
        );


    if (!elemento) {

        return;

    }


    if (
        !elemento.data
    ) {

        return;

    }


    Plotly.relayout(

        grafica,

        {

            shapes: [

                {

                    type:
                        "line",

                    x0:
                        tiempo,

                    x1:
                        tiempo,

                    y0:
                        0,

                    y1:
                        1,

                    yref:
                        "paper",

                    line: {

                        width:
                            2,

                        dash:
                            "dash"

                    }

                }

            ],


            annotations: [

                {

                    x:
                        tiempo,

                    y:
                        valor,

                    text:
                        `${tiempo.toFixed(2)} s`,

                    showarrow:
                        true,

                    arrowhead:
                        2,

                    ax:
                        0,

                    ay:
                        -35

                }

            ]

        }

    );

}


// =====================================================
// INICIAR ANIMACIÓN GENERAL
// =====================================================

function iniciarAnimacion() {

    if (!resultadoSimulacion) {

        return;

    }


    const tiempoMaximo =
        resultadoSimulacion.tiempo[
            resultadoSimulacion.tiempo.length - 1
        ];


    // =================================================
    // SI ESTÁ EN EL FINAL
    // =================================================

    if (
        tiempoActual >=
        tiempoMaximo
    ) {

        tiempoActual = 0;

    }


    reproduciendo = true;


    const boton =
        document.getElementById(
            "btnPlay"
        );


    if (boton) {

        boton.textContent =
            "❚❚";

    }


    // =================================================
    // ANIMACIÓN
    // =================================================

    intervaloAnimacion =
        setInterval(

            () => {

                tiempoActual +=
                    0.02;


                // =====================================
                // FINAL
                // =====================================

                if (
                    tiempoActual >=
                    tiempoMaximo
                ) {

                    tiempoActual =
                        tiempoMaximo;


                    actualizarSimulacion(
                        tiempoActual
                    );


                    detenerAnimacion();

                    return;

                }


                // =====================================
                // ACTUALIZAR
                // =====================================

                actualizarSimulacion(
                    tiempoActual
                );

            },

            20

        );

}


// =====================================================
// DETENER ANIMACIÓN GENERAL
// =====================================================

function detenerAnimacion() {

    reproduciendo = false;


    if (
        intervaloAnimacion !== null
    ) {

        clearInterval(
            intervaloAnimacion
        );


        intervaloAnimacion =
            null;

    }


    const boton =
        document.getElementById(
            "btnPlay"
        );


    if (boton) {

        boton.textContent =
            "▶";

    }

}