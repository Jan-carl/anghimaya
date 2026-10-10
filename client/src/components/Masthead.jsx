import { Reveal } from './Reveal.jsx';
import { SectionHead } from './ui.jsx';

/**
 * Tanggapan ng Patnugutan: Ang Himaya Publication Charter & Institutional Identity
 * Official Student Campus Publication of the Polytechnic University of the Philippines – Lopez Campus
 * “Pluma ng Katotohanan, Haligi ng Katapatan”
 */
export function Masthead() {
  return (
    <section className="section" id="masthead">
      <div className="container">
        <Reveal>
          <SectionHead
            eyebrow="TANGGAPAN NG PATNUGUTAN"
            title="ANG HIMAYA PUBLICATION"
          />
        </Reveal>

        {/* OPISYAL NA CHARTER AT KASAYSAYAN NG PUBLIKASYON (BROADSHEET EDITORIAL SHEET) */}
        <Reveal as="article" className="tfm-charter-sheet">
          {/* MASTHEAD NAMEPLATE */}
          <header className="tfm-charter-nameplate">
            <div className="tfm-charter-nameplate__emblem-wrap">
              <img
                src="/anghimayalogo.png"
                alt="Sagisag ng Ang Himaya"
                className="tfm-charter-nameplate__emblem"
              />
            </div>
            <span className="tfm-charter-nameplate__univ">
              POLITEKNIKONG UNIBERSIDAD NG PILIPINAS — KAMPUS NG LOPEZ
            </span>
            <h2 className="tfm-charter-nameplate__title">
              ANG HIMAYA PUBLICATION
            </h2>
            <p className="tfm-charter-nameplate__sub">
              Official Student Campus Publication of the Polytechnic University of the Philippines – Lopez Campus
            </p>
            <div className="tfm-charter-nameplate__motto-bar">
              <span className="tfm-charter-nameplate__motto">
                “Pluma ng Katotohanan, Haligi ng Katapatan”
              </span>
            </div>
          </header>

          {/* EDITORIAL COLUMNS: ABOUT, NAME, TAGLINE vs. VISION & MISSION */}
          <div className="tfm-charter-grid">
            {/* COLUMN 1: ABOUT & IDENTITY */}
            <div className="tfm-charter-col">
              <section className="tfm-charter-section">
                <h3 className="tfm-charter-section__title">ABOUT ANG HIMAYA</h3>
                <div className="tfm-charter-prose">
                  <p>
                    <strong>Ang Himaya Publication</strong> is the official student campus publication of the Polytechnic University of the Philippines – Lopez Campus.
                  </p>
                  <p>
                    Guided by the principles of truth, integrity, editorial independence, and responsible journalism, Ang Himaya serves as a platform for informing and engaging the University community through news, features, opinions, literary works, multimedia content, and other forms of campus journalism.
                  </p>
                  <p>
                    The Publication seeks not only to document the events and experiences of the PUP Lopez community but also to cultivate student journalists who are competent, principled, critical, and socially responsible.
                  </p>
                </div>
              </section>

              <section className="tfm-charter-section">
                <h3 className="tfm-charter-section__title">OUR NAME</h3>
                <div className="tfm-charter-prose">
                  <p>
                    The name <em>“Ang Himaya”</em> is derived from the Filipino word <strong>“himaya,”</strong> which signifies glory, honor, excellence, and distinction.
                  </p>
                  <p>
                    The name reflects the Publication's aspiration to uphold truth, integrity, and excellence in campus journalism while bringing honor to the Polytechnic University of the Philippines – Lopez Campus through responsible, ethical, and independent journalism.
                  </p>
                </div>
              </section>

              <section className="tfm-charter-section">
                <h3 className="tfm-charter-section__title">OUR TAGLINE</h3>
                <div className="tfm-charter-tagline-box">
                  <h4 className="tfm-charter-tagline-box__heading">
                    “PLUMA NG KATOTOHANAN, HALIGI NG KATAPATAN”
                  </h4>
                  <p>
                    The official tagline of Ang Himaya Publication embodies its commitment to truth, integrity, ethical journalism, and responsible service to the University community.
                  </p>
                  <p>
                    The <strong>pluma</strong> represents the journalist's responsibility to write, document, and speak truthfully.
                  </p>
                  <p>
                    The <strong>haligi</strong> represents the Publication's role as a steadfast institution that upholds <em>katapatan</em>—honesty, integrity, and faithfulness to its journalistic principles.
                  </p>
                  <p className="tfm-charter-prose__emphasis">
                    Together, the tagline reflects Ang Himaya's commitment to being a publication that does not merely tell stories, but carries the responsibility that comes with telling them.
                  </p>
                </div>
              </section>
            </div>

            {/* COLUMN 2: VISION & MISSION */}
            <div className="tfm-charter-col">
              <section className="tfm-charter-section tfm-charter-section--highlight">
                <h3 className="tfm-charter-section__title">VISION</h3>
                <div className="tfm-charter-prose">
                  <p className="tfm-charter-lead">
                    Ang Himaya Publication envisions itself as a credible, progressive, and competitive campus publication recognized for excellence in responsible journalism, impactful storytelling, and the fearless pursuit of truth.
                  </p>
                  <p>
                    It aspires to transcend the boundaries of the University by producing principled and competent student journalists who contribute meaningfully to public discourse, uphold democratic values, and serve society through ethical and independent journalism.
                  </p>
                </div>
              </section>

              <section className="tfm-charter-section tfm-charter-section--highlight">
                <h3 className="tfm-charter-section__title">MISSION</h3>
                <div className="tfm-charter-prose">
                  <p>
                    Ang Himaya Publication is committed to producing accurate, fair, ethical, and responsible journalism that informs, educates, and empowers the PUP Lopez Campus community and the public.
                  </p>
                  <p>
                    It shall provide a credible platform for the free exchange of ideas, promote critical inquiry and meaningful discourse, uphold truth, accountability, and editorial independence, and cultivate competent, principled, and socially responsible student journalists.
                  </p>
                  <p>
                    The Publication shall actively participate in press conferences, journalism competitions, research initiatives, media collaborations, community engagement, and other professional and academic platforms to strengthen the competence of its members and promote the excellence of PUP Lopez Campus.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* FULL-WIDTH BROADSHEET CHRONICLE: OUR HISTORY */}
          <section className="tfm-charter-history">
            <div className="tfm-charter-history__header">
              <span className="tfm-charter-history__eyebrow">KASAYSAYAN NG PAMAHAYAGANG MAG-AARAL</span>
              <h3 className="tfm-charter-history__title">OUR HISTORY</h3>
              <p className="tfm-charter-history__sub">
                Mula sa Pamana ng Epitome Hanggang sa Pagkakatatag at Paglago ng Ang Himaya
              </p>
            </div>

            <div className="tfm-charter-history__body">
              <div className="tfm-charter-history__col">
                <p>
                  The story of Ang Himaya Publication begins with the changing landscape of campus journalism at PUP Lopez Campus.
                </p>
                <p>
                  Before Ang Himaya, the University community was served by <strong>Epitome</strong>, a student publication that existed for approximately 22 years ago. During its later years, Epitome became increasingly associated with student activism and critical campus discourse. Its eventual discontinuation created a significant gap in the campus press, resulting in a long period without a formally established student publication.
                </p>
                <p>
                  This period marked a transition in the history of campus journalism at PUP Lopez. The absence of a publication meant that it would take several years before a new student press would emerge to once again provide a platform for campus news, student perspectives, and critical discourse.
                </p>
              </div>

              <div className="tfm-charter-history__col">
                <p>
                  In <strong>Academic Year 2024–2025</strong>, Ang Himaya Publication was established as a new chapter in the University's campus journalism tradition.
                </p>
                <p>
                  Starting with only <strong>10 members</strong>, Ang Himaya began its work as the official student campus publication of the Polytechnic University of the Philippines – Lopez Campus. While it inherited the broader tradition of campus journalism, Ang Himaya established its own identity, principles, and organizational foundation.
                </p>
                <p>
                  In the succeeding academic years, the Publication continued to grow. Its membership expanded, its coverage developed, and its participation in journalism and University activities increased.
                </p>
                <p>
                  By <strong>Academic Year 2026–2027</strong>, Ang Himaya had grown to approximately <strong>40 members</strong>—a significant expansion from its original 10-member team.
                </p>
              </div>
            </div>

            <div className="tfm-charter-history__credo">
              <p>
                Today, Ang Himaya continues to build its own institutional history while recognizing the place of Epitome in the earlier tradition of campus journalism at PUP Lopez. The Publication carries forward the fundamental role of the campus press: to inform, to question, to document, and to serve the University community through responsible and independent journalism.
              </p>
              <blockquote className="tfm-charter-history__quote">
                “From the legacy of the past to the voices of a new generation, Ang Himaya continues to write the next chapter of campus journalism at PUP Lopez.”
              </blockquote>
            </div>
          </section>

          {/* OFFICIAL CEGP SEAL & ACCREDITATION FOOTER */}
          <footer className="tfm-charter-footer">
            <div className="tfm-charter-footer__seal">
              <img src="/anghimayalogo.png" alt="" aria-hidden="true" />
              <div>
                <strong>Opisyal na Pagkilala at Pederasyon</strong>
                <span>
                  Ang Himaya ay lehitimong kasapi ng <strong>College Editors Guild of the Philippines (CEGP)</strong>, ang pinakamatanda at pinakamalawak na pambansang alyansa ng mga pahayagang mag-aaral sa Asya-Pasipiko.
                </span>
              </div>
            </div>
          </footer>
        </Reveal>
      </div>
    </section>
  );
}

export default Masthead;