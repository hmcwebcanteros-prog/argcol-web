---
title: "Sortino y SQN"
date: "2025-01-12T13:28:00.000-03:00"
slug: "sortino-y-sqn"
section: "ratios"
type: "articulo"
tags: ["Finanzas", "Inversión", "Ratios"]
description: ""
hero: ""
heroAlt: ""
oldUrl: "https://notas.argcol.com.ar/2025/01/sortino-y-sqn.html"
draft: false
---

![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3zfjPNUpz0SwgDX3R8ETf6Q09-GDqZYJzuZlaSQ0_zndwV3w2di8RflDQ5ppfWv2N_jr9uaAT2XlC0eIzoaGbEaAwc3eArwyB5ljR30BbiJh2Fp2TpiDi7skVRJaLHu-iK2ppCNs50g9V39hDCf9DTXmrDbJxJS5RN3Fmwd4Z40Y43_nWhKtdCZ5cYgE/w573-h430/SQR%20SORTINO.jpg)

### Sortino y SQN

## 1. Sortino Ratio

Es una métrica utilizada para evaluar el rendimiento ajustado al riesgo de una inversión, enfocándose únicamente en la volatilidad negativa (las pérdidas). A diferencia del Sharpe Ratio, que considera tanto la volatilidad positiva como negativa, el Sortino Ratio mide el rendimiento de una inversión en relación al riesgo asociado con rendimientos por debajo de un umbral definido (generalmente 0 o una tasa libre de riesgo).

### Fórmula:

Sortino Ratio = (R_p - R_f) / σ_D

Donde:
- R_p: Rendimiento promedio del portafolio.
- R_f: Tasa libre de riesgo.
- σ_D: Desviación estándar de los rendimientos negativos.

### Ejemplo:

Supongamos que un fondo tiene un rendimiento promedio anual del 10%, la tasa libre de riesgo es del 2% y la desviación estándar de los rendimientos negativos es del 5%.
Sortino Ratio = (10% - 2%) / 5% = 1.6
Un Sortino Ratio mayor a 1 indica un buen rendimiento ajustado al riesgo.

##

##

## 2. SQN (System Quality Number)

Es una métrica desarrollada por Van Tharp para evaluar la calidad de un sistema de trading. Mide la relación entre la ganancia promedio por operación y la desviación estándar de las ganancias, ajustada por la raíz cuadrada del número de operaciones.

### Fórmula:

SQN = (Promedio de Rendimientos / Desviación Estándar de Rendimientos) × √Número de Operaciones

### Interpretación:

- SQN < 1.6: Sistema pobre.
- 1.6 ≤ SQN < 2.0: Sistema aceptable.
- 2.0 ≤ SQN < 3.0: Buen sistema.
- SQN ≥ 3.0: Sistema excelente.

### Ejemplo:

Supongamos un sistema de trading con:
- Ganancia promedio por operación: $100.
- Desviación estándar de ganancias: $50.
- Número de operaciones: 30.

SQN = (100 / 50) × √30 = 10.95
Un valor tan alto indicaría un sistema de excelente calidad.

###

###

### Comparación y Uso:

**Métrica**

**Propósito**

**Fórmula Base**

**Enfoque**

**Sortino**

Mide rendimiento ajustado a riesgo negativo.

(R_p - R_f) / σ_D

Riesgo financiero

**SQN**

Evalúa la calidad de sistemas de trading.

(Media / Desviación) × √n

Sistemas de trading
