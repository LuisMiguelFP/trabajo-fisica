from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np


# =====================================================
# CONFIGURACIÓN DE FLASK
# =====================================================

app = Flask(__name__)

CORS(app)


# =====================================================
# RUTA PRINCIPAL
# =====================================================

@app.route("/")
def inicio():

    return jsonify({
        "mensaje": "API de Física Interactiva funcionando"
    })


# =====================================================
# MOVIMIENTO VERTICAL
# =====================================================

@app.route(
    "/api/movimiento-vertical",
    methods=["POST"]
)
def movimiento_vertical():

    datos = request.get_json()


    # =================================================
    # RECIBIR PARÁMETROS
    # =================================================

    altura_inicial = float(
        datos.get(
            "altura_inicial",
            10
        )
    )


    velocidad_inicial = float(
        datos.get(
            "velocidad_inicial",
            0
        )
    )


    gravedad = float(
        datos.get(
            "gravedad",
            9.81
        )
    )


    tiempo_total = float(
        datos.get(
            "tiempo_total",
            5
        )
    )


    # =================================================
    # VALIDACIONES
    # =================================================

    if altura_inicial <= 0:

        return jsonify({
            "error":
                "La altura inicial debe ser mayor que 0."
        }), 400


    if gravedad <= 0:

        return jsonify({
            "error":
                "La gravedad debe ser mayor que 0."
        }), 400


    if tiempo_total <= 0:

        return jsonify({
            "error":
                "El tiempo total debe ser mayor que 0."
        }), 400


    # =================================================
    # CALCULAR TIEMPO DE IMPACTO
    #
    # y = y0 + v0*t - 1/2*g*t²
    #
    # Buscamos:
    #
    # y = 0
    # =================================================

    discriminante = (
        velocidad_inicial ** 2
        +
        2 * gravedad * altura_inicial
    )


    tiempo_impacto = (
        velocidad_inicial
        +
        np.sqrt(discriminante)
    ) / gravedad


    # =================================================
    # ALTURA MÁXIMA
    # =================================================

    if velocidad_inicial > 0:

        tiempo_altura_maxima = (
            velocidad_inicial /
            gravedad
        )


        altura_maxima = (
            altura_inicial
            +
            velocidad_inicial *
            tiempo_altura_maxima
            -
            0.5 *
            gravedad *
            tiempo_altura_maxima ** 2
        )

    else:

        tiempo_altura_maxima = 0

        altura_maxima = altura_inicial


    # =================================================
    # VELOCIDAD DE IMPACTO
    # =================================================

    velocidad_impacto = (
        velocidad_inicial
        -
        gravedad *
        tiempo_impacto
    )


    # =================================================
    # DETERMINAR TIEMPO REAL DE SIMULACIÓN
    # =================================================

    tiempo_final = min(
        tiempo_total,
        tiempo_impacto
    )


    # =================================================
    # GENERAR TIEMPOS
    # =================================================

    tiempos = np.linspace(
        0,
        tiempo_final,
        200
    )


    # =================================================
    # ECUACIONES FÍSICAS
    # =================================================

    posicion = (
        altura_inicial
        +
        velocidad_inicial * tiempos
        -
        0.5 *
        gravedad *
        tiempos ** 2
    )


    velocidad = (
        velocidad_inicial
        -
        gravedad *
        tiempos
    )


    aceleracion = np.full_like(
        tiempos,
        -gravedad
    )


    # =================================================
    # FORZAR EL ÚLTIMO PUNTO A SER EL SUELO
    # =================================================

    if tiempo_final == tiempo_impacto:

        posicion[-1] = 0

        velocidad[-1] = velocidad_impacto


    # =================================================
    # RESPUESTA
    # =================================================

    return jsonify({

        "tiempo":
            tiempos.tolist(),

        "posicion":
            posicion.tolist(),

        "velocidad":
            velocidad.tolist(),

        "aceleracion":
            aceleracion.tolist(),

        "tiempo_impacto":
            float(tiempo_impacto),

        "velocidad_impacto":
            float(velocidad_impacto),

        "altura_maxima":
            float(altura_maxima),

        "tiempo_altura_maxima":
            float(tiempo_altura_maxima)

    })


# =====================================================
# INICIAR SERVIDOR
# =====================================================

if __name__ == "__main__":

    app.run(

        debug=True,

        host="0.0.0.0",

        port=5000

    )