import { renderToStaticMarkup } from 'react-dom/server';

export function formatReservationDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (number) => String(number).padStart(2, '0');
  return `${pad(date.getDate())}:${pad(date.getMonth() + 1)}:${pad(date.getFullYear() % 100)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function printReservationInvoice(reservation, t) {
  const popup = window.open('', '_blank', 'width=850,height=1000');
  if (!popup) throw new Error(t('Allow pop-ups to print the invoice.'));
  const rows = [
    ['Vehicle', reservation.vehicle_name || reservation.vehicle],
    ['Pickup Location', reservation.pickup_location_name || reservation.pickup_location],
    ['Dropoff Location', reservation.dropoff_location_name || reservation.dropoff_location],
    ['Pickup Date', formatReservationDate(reservation.pickup_date)],
    ['Return Date', formatReservationDate(reservation.return_date)],
    ['Extras', reservation.extra_details?.map((extra) => `${extra.name} × ${extra.quantity}`).join(', ') || t('None')],
  ];
  const markup = renderToStaticMarkup(
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{t('Invoice')} — {reservation.reference}</title>
        <style>{`
          @page { size: A4; margin: 20mm; }
          * { box-sizing: border-box; }
          body { margin: 0; padding: 35px; color: #17283c; font: 14px Arial, sans-serif; }
          header { display: flex; justify-content: space-between; border-bottom: 3px solid #ed7647; padding-bottom: 24px; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          h2 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #667085; }
          p { margin: 6px 0; overflow-wrap: anywhere; }
          .customer { margin: 28px 0; padding: 18px; background: #faf7f3; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 14px 8px; border-bottom: 1px solid #e6e8eb; text-align: start; vertical-align: top; }
          th { width: 38%; color: #667085; font-weight: normal; }
          .total { display: flex; justify-content: space-between; margin-top: 25px; padding: 20px; background: #fff1e8; font-size: 20px; font-weight: bold; }
          footer { margin-top: 40px; color: #667085; font-size: 12px; text-align: center; }
          @media print { body { padding: 0; } .customer, .total { print-color-adjust: exact; } }
        `}</style>
      </head>
      <body>
        <header>
          <div><h1>Rently</h1><p>{t('Invoice')}</p></div>
          <div><strong>{reservation.reference}</strong><p>{formatReservationDate(reservation.created_at)}</p><p>{t(reservation.status)}</p></div>
        </header>
        <section className="customer">
          <h2>{t('Customer')}</h2>
          <strong>{reservation.driver_name}</strong>
          <p>{reservation.email}</p><p>{reservation.phone}</p>
        </section>
        <table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{t(label)}</th><td>{value || '—'}</td></tr>)}</tbody></table>
        <div className="total"><span>{t('Total Price')}</span><span>{Number(reservation.total_price).toFixed(2)} MAD</span></div>
        <footer>{t('Reservation')} · {reservation.reference}</footer>
      </body>
    </html>,
  );
  popup.document.write(`<!doctype html>${markup}`);
  popup.document.close();
  popup.focus();
  popup.print();
}
