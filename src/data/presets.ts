import { TemplatePreset } from '../types';

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'cobranza-recordatorio',
    title: 'Recordatorio de Pago / Saldo Pendiente',
    description: 'Notifica vencimiento de facturas y montos pendientes de forma profesional.',
    category: 'Finanzas',
    template: `Hola *{{nombre}}*, esperamos que estés excelente. Te escribimos de *Cobranzas Express* para recordarte que tu factura *#{{num_factura}}* por un saldo de *{{monto}}* vence el *{{fecha_vencimiento}}*. 

💳 Puedes cancelarla mediante transferencia al CBU indicado o enviarnos el comprobante por este mismo medio.

¿Podrías confirmarnos si ya realizaste el pago? ¡Muchas gracias por tu compromiso! ✨`,
    sampleColumns: ['Cliente', 'Telefono', 'Num_Factura', 'Monto_Pendiente', 'Fecha_Vencimiento', 'Ciudad'],
    phoneColumn: 'Telefono',
    nameColumn: 'Cliente',
    sampleData: [
      {
        Cliente: 'Carlos Mendoza',
        Telefono: '525512345678',
        Num_Factura: 'FAC-9081',
        Monto_Pendiente: '1450.00',
        Fecha_Vencimiento: '15/11/2026',
        Ciudad: 'Ciudad de México',
      },
      {
        Cliente: 'Valeria Gómez',
        Telefono: '525598765432',
        Num_Factura: 'FAC-9082',
        Monto_Pendiente: '3200.50',
        Fecha_Vencimiento: '18/11/2026',
        Ciudad: 'Guadalajara',
      },
      {
        Cliente: 'Martín Rodríguez',
        Telefono: '5491144556677',
        Num_Factura: 'FAC-9083',
        Monto_Pendiente: '890.00',
        Fecha_Vencimiento: '20/11/2026',
        Ciudad: 'Buenos Aires',
      },
      {
        Cliente: 'Camila Torres',
        Telefono: '573101234567',
        Num_Factura: 'FAC-9084',
        Monto_Pendiente: '2150.00',
        Fecha_Vencimiento: '22/11/2026',
        Ciudad: 'Bogotá',
      },
      {
        Cliente: 'Alejandro Morales',
        Telefono: '34612345678',
        Num_Factura: 'FAC-9085',
        Monto_Pendiente: '475.80',
        Fecha_Vencimiento: '25/11/2026',
        Ciudad: 'Madrid',
      },
    ],
  },
  {
    id: 'ecommerce-despacho',
    title: 'Despacho & Seguimiento de Pedido',
    description: 'Envía número de guía y transportadora para compras en línea.',
    category: 'Ecommerce',
    template: `¡Hola *{{nombre}}*! 📦 Tu pedido *#{{pedido}}* con *{{producto}}* ya fue empaquetado y va en camino.

🚚 *Transportadora:* {{transportadora}}
📍 *Número de Guía:* \`{{guia}}\`
🗓️ *Fecha estimada de entrega:* {{fecha_entrega}}

Puedes rastrearlo en todo momento. ¡Gracias por confiar en nuestra tienda! Si tienes alguna duda, escríbenos por aquí.`,
    sampleColumns: ['Nombre_Comprador', 'Whatsapp', 'Pedido_ID', 'Articulo', 'Empresa_Envio', 'Guia_Rastreo', 'Entrega_Estimada'],
    phoneColumn: 'Whatsapp',
    nameColumn: 'Nombre_Comprador',
    sampleData: [
      {
        Nombre_Comprador: 'Lucía Fernández',
        Whatsapp: '525588990011',
        Pedido_ID: 'PED-4410',
        Articulo: 'Zapatillas Urban Pro Talle 38',
        Empresa_Envio: 'FedEx Express',
        Guia_Rastreo: 'FX-889123019',
        Entrega_Estimada: 'Viernes 7 de Noviembre',
      },
      {
        Nombre_Comprador: 'Diego Arismendi',
        Whatsapp: '5491122334455',
        Pedido_ID: 'PED-4411',
        Articulo: 'Auriculares Inalámbricos Pro ANC',
        Empresa_Envio: 'Andreani',
        Guia_Rastreo: 'AND-99023188',
        Entrega_Estimada: 'Lunes 10 de Noviembre',
      },
      {
        Nombre_Comprador: 'Sofía Navarro',
        Whatsapp: '573009988776',
        Pedido_ID: 'PED-4412',
        Articulo: 'Cafetera Espresso Barista Touch',
        Empresa_Envio: 'Servientrega',
        Guia_Rastreo: 'SER-44512093',
        Entrega_Estimada: 'Miércoles 12 de Noviembre',
      },
    ],
  },
  {
    id: 'turno-cita',
    title: 'Confirmación de Turno / Cita Médica',
    description: 'Recordatorio automático con profesional, fecha, hora y sede.',
    category: 'Salud & Servicios',
    template: `Estimado/a *{{nombre}}*, le recordamos su cita con el/la *{{especialista}}* para el servicio de *{{servicio}}*.

📅 *Fecha:* {{fecha_cita}}
⏰ *Hora:* {{hora_cita}}
🏥 *Sede:* {{consultorio}}

⚠️ Por favor responda *CONFIRMO* a este mensaje para asegurar su turno o avísenos con 24h de anticipación si requiere reprogramar. ¡Le esperamos!`,
    sampleColumns: ['Paciente', 'Celular', 'Doctor', 'Especialidad', 'Fecha', 'Hora', 'Sucursal'],
    phoneColumn: 'Celular',
    nameColumn: 'Paciente',
    sampleData: [
      {
        Paciente: 'Javier Castillo',
        Celular: '525533445566',
        Doctor: 'Dr. Roberto Silva',
        Especialidad: 'Odontología General',
        Fecha: '10 de Noviembre',
        Hora: '15:30 hs',
        Sucursal: 'Sede Centro - Piso 3 Consultorio 302',
      },
      {
        Paciente: 'Mariana Duarte',
        Celular: '5491166778899',
        Doctor: 'Dra. Elena Rossi',
        Especialidad: 'Dermatología Clínica',
        Fecha: '11 de Noviembre',
        Hora: '11:00 hs',
        Sucursal: 'Sede Norte - Consultorio 14',
      },
      {
        Paciente: 'Pablo Echeverría',
        Celular: '56987654321',
        Doctor: 'Dr. Fernando Bravo',
        Especialidad: 'Traumatología',
        Fecha: '12 de Noviembre',
        Hora: '16:45 hs',
        Sucursal: 'Clínica Las Condes - Módulo B',
      },
    ],
  },
  {
    id: 'promo-fidelizacion',
    title: 'Promoción Exclusiva & Cupón VIP',
    description: 'Campañas de fidelización con nombre y código de descuento único.',
    category: 'Marketing',
    template: `¡Hola *{{nombre}}*! 🎁 Por ser parte de nuestra comunidad VIP te preparamos un beneficio especial:

Disfruta de un *{{descuento}}* en tu próxima compra de *{{categoria}}* usando tu cupón personal:
🏷️ Código: \`{{cupon}}\`

Válido hasta el *{{fecha_limite}}*. ¡No te lo pierdas!
Escríbenos para enviarte el catálogo exclusivo. 🛍️`,
    sampleColumns: ['Cliente_VIP', 'Telefono_Whatsapp', 'Porcentaje_Desc', 'Seccion', 'Codigo_Cupon', 'Validez'],
    phoneColumn: 'Telefono_Whatsapp',
    nameColumn: 'Cliente_VIP',
    sampleData: [
      {
        Cliente_VIP: 'Lorena Paredes',
        Telefono_Whatsapp: '525544332211',
        Porcentaje_Desc: '25% OFF',
        Seccion: 'Colección Verano 2026',
        Codigo_Cupon: 'VIP-LORENA25',
        Validez: '30 de Noviembre',
      },
      {
        Cliente_VIP: 'Gonzalo Vega',
        Telefono_Whatsapp: '5491133221100',
        Porcentaje_Desc: '30% OFF',
        Seccion: 'Calzado & Accesorios',
        Codigo_Cupon: 'VIP-GONZA30',
        Validez: '30 de Noviembre',
      },
      {
        Cliente_VIP: 'Andrea Rivas',
        Telefono_Whatsapp: '51987654321',
        Porcentaje_Desc: '20% OFF',
        Seccion: 'Tecnología & Audio',
        Codigo_Cupon: 'VIP-ANDREA20',
        Validez: '05 de Diciembre',
      },
    ],
  },
];
