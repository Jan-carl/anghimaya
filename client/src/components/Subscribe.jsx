import { useState } from 'react';
import { Reveal } from './Reveal.jsx';

const EMAIL = 'puplopezanghimaya@gmail.com';

/** Call-to-action para sa digital na edisyon hango sa thefrontman.ph */
export function Subscribe() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent('Mag-subscribe sa Ang Himaya');
    const body = encodeURIComponent(`Nais kong mag-subscribe sa mga bagong labas ng Ang Himaya.\n\nEmail: ${email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setDone(true);
  };

  return (
    <section className="section" id="subscribe">
      <div className="container">
        <Reveal as="div" className="tfm-subscribe-card">
          <div className="tfm-subscribe-card__inner">
            <span className="tfm-category tfm-category--gold">NEWSLETTER</span>
            <h2 className="tfm-subscribe-card__title">Maging Bahagi ng Ang Himaya</h2>
            <p className="tfm-subscribe-card__desc">
              Makatanggap ng pinakabagong isyu, balitang pangkampus, at mga anunsyo nang direkta sa iyong email inbox.
            </p>

            {done ? (
              <div className="tfm-subscribe-card__success" role="status">
                ✓ Salamat! Binubuksan na ang iyong email client para sa kumpirmasyon.
              </div>
            ) : (
              <form className="tfm-subscribe-form" onSubmit={handleSubmit}>
                <label className="visually-hidden" htmlFor="subscribe-email">
                  Email address
                </label>
                <input
                  id="subscribe-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="iyong.email@iskolarngbayan.pup.edu.ph"
                  className="tfm-subscribe-input"
                />
                <button type="submit" className="btn btn--maroon tfm-subscribe-btn">
                  Mag-subscribe <span aria-hidden="true">→</span>
                </button>
              </form>
            )}

            <p className="tfm-subscribe-note">
              Nais mag-ambag ng sanaysay, tula, o liham sa patnugot? Sumulat sa{' '}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Subscribe;