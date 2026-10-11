import { Reveal } from './Reveal.jsx';
import { SectionHead } from './ui.jsx';

/**
 * Tanggapan ng Patnugutan: Ang Himaya Publication Charter & Institutional Identity
 * Opisyal na Pamahayagang Mag-aaral ng Politeknikong Unibersidad ng Pilipinas – Kampus ng Lopez
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

        {/* OPISYAL NA KASUNDAAN AT KASAYSAYAN NG PUBLIKASYON (BROADSHEET EDITORIAL SHEET) */}
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
              Opisyal na Pamahayagang Mag-aaral ng Politeknikong Unibersidad ng Pilipinas – Kampus ng Lopez
            </p>
            <div className="tfm-charter-nameplate__motto-bar">
              <span className="tfm-charter-nameplate__motto">
                “Pluma ng Katotohanan, Haligi ng Katapatan”
              </span>
            </div>
          </header>

          {/* EDITORIAL COLUMNS: ABOUT, NAME, TAGLINE vs. PANGARAP & MISYON */}
          <div className="tfm-charter-grid">
            {/* COLUMN 1: ABOUT & IDENTITY */}
            <div className="tfm-charter-col">
              <section className="tfm-charter-section">
                <h3 className="tfm-charter-section__title">TUNGKOL SA ANG HIMAYA</h3>
                <div className="tfm-charter-prose">
                  <p>
                    Ang <strong>Ang Himaya Publication</strong> ay ang opisyal na pamahayagang mag-aaral ng Politeknikong Unibersidad ng Pilipinas – Kampus ng Lopez.
                  </p>
                  <p>
                    Batay sa mga tuntunin ng katotohanan, katapatan, kalayaan sa editoryal, at responsableng pamamahayagan, ang Ang Himaya ay naglilingkod bilang isang plataporma para sa pagpapalaganap ng impormasyon at pagpakikilahok ng komunidad ng Unibersidad sa pamamagitan ng balita, artikulo, opinyon, panitikan, multinedyong nilalaman, at iba pang anyo ng pamamahayagang mag-aaral.
                  </p>
                  <p>
                    Hindi lamang nagtatalo ang Pambansang ito sa mga pangyayari at karanasan ng komunidad ng PUP Lopez, kundi nagtatayo rin ito ng mga mag-aaral na may kakayahan, may prinsipyo, kritikal, at pananagutang panlahat sa lipunan.
                  </p>
                </div>
              </section>

              <section className="tfm-charter-section">
                <h3 className="tfm-charter-section__title">ANG AMING PAGPAPALAGYAN</h3>
                <div className="tfm-charter-prose">
                  <p>
                    Ang aming pagpapalagyan ay nagmula sa salitang Filipino na <strong>“himaya,”</strong> na nangangahulugang kaluya, karangalan, kahusayan, at pagtatangi.
                  </p>
                  <p>
                    Ipinapakita ng pagpapalagyang ito ang hangarin ng Pambansang ito na itaas ang katotohanan, katapatan, at kahusayan sa pamamahayagang mag-aaral, habang nagdala ng karangalan sa Politeknikong Unibersidad ng Pilipinas – Kampus ng Lopez sa pamamagitan ng responsable, etikal, at malayang pamamahayagan.
                  </p>
                </div>
              </section>

              <section className="tfm-charter-section">
                <h3 className="tfm-charter-section__title">ANG AMING TAGLINE</h3>
                <div className="tfm-charter-tagline-box">
                  <h4 className="tfm-charter-tagline-box__heading">
                    “PLUMA NG KATOTOHANAN, HALIGI NG KATAPATAN”
                  </h4>
                  <p>
                    Ang opisyal na tagline ng Ang Himaya ay naglalaman ng katapatan nito sa katotohanan, katapatagan ng loob, etikal na pamamahayagan, at responsableng paglilingkod sa komunidad ng Unibersidad.
                  </p>
                  <p>
                    Ang <strong>pluma</strong> ay kumakatawan sa responsibilidad ng mamamahayag na sumulat, magtala, at magsalita nang may katapatan.
                  </p>
                  <p>
                    Ang <strong>haligi</strong> ay kumakatawan sa tungkulin ng Pambansang ito bilang matatag na institusyon na nagtatangguyod ng <em>katapatan</em>—kawalan ng pansinlang, katapatagan ng loob, at pagkakatapat sa sariling prinsipyo sa pamamahayagan.
                  </p>
                  <p className="tfm-charter-prose__emphasis">
                    Sa kabuuan, pinapakita ng tagline na ito ang katapatan ng Ang Himaya bilang isang pamahayagan na hindi lamang nagsasalaysay ng mga kuwento, kundi may tinataglay na responsibilidad na kasama ng pagkakasaysay.
                  </p>
                </div>
              </section>
            </div>

            {/* COLUMN 2: PANGARAP & MISYON */}
            <div className="tfm-charter-col">
              <section className="tfm-charter-section tfm-charter-section--highlight">
                <h3 className="tfm-charter-section__title">PANGARAP</h3>
                <div className="tfm-charter-prose">
                  <p className="tfm-charter-lead">
                    Ang Ang Himaya Publication ay naghahain na maging isang pamahayagang mag-aaral sa kampus na may kredibilidad, progresibo, at makikipantayan sa kumpetisyon; kinikilala sa kahusayan sa responsableng pamamahayagan, sa makabuluhang pagkukwento, at sa matapang na pagtataguyod ng katotohanan.
                  </p>
                  <p>
                    Naghahain itong lampas sa hangganan ng Unibersidad sa pamamagitan ng paggawa ng mga mag-aaral na mamumuno at may kakayahan, na nag-aambag nang makabuluhan sa usaping pampubliko, nagtatangguyod ng mga halagang demokratiko, at naglilingkod sa lipunan sa pamamagitan ng etikal at malayang pamamahayagan.
                  </p>
                </div>
              </section>

              <section className="tfm-charter-section tfm-charter-section--highlight">
                <h3 className="tfm-charter-section__title">MISYON</h3>
                <div className="tfm-charter-prose">
                  <p>
                    Ang Ang Himaya Publication ay nakatalaga sa paggawa ng tapat, walang kinikilingan, etikal, at responsableng pamamahayagan na nagpapaalam, nagtuturo, at nagpapalakas sa komunidad ng PUP Lopez Kampus at sa publiko.
                  </p>
                  <p>
                    Magbibigay ito ng mapanatag na plataporma para sa malayang palitan ng ideya, susulong sa makatotohanang pagsusuri at makabuluhang usapan, magtatangguyod ng katotohanan, pananagutan, at kalayaan sa editoryal, at magpapalago ng mga mag-aaral na may prinsipyo at pananagutang panlahat sa lipunan.
                  </p>
                  <p>
                    Aktibong makikipagtulungan ang Pambansang ito sa mga dyaryo, timpok ng pamamahayagan, inisyatibong pananaliksik, pakikipagtulungan sa midya, pakikilahok sa komunidad, at iba pang platapormang propesyonal at akademiko, upang lakasin ang kakayahan ng kaniyang mga kasapi at ipagpromote ang kahusayan ng PUP Lopez Kampus.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* FULL-WIDTH BROADSHEET CHRONICLE: KASAYSAYAN */}
          <section className="tfm-charter-history">
            <div className="tfm-charter-history__header">
              <span className="tfm-charter-history__eyebrow">KASAYSAYAN NG PAMAHAYAGANG MAG-AARAL</span>
              <h3 className="tfm-charter-history__title">ANG AMING KASAYSAYAN</h3>
              <p className="tfm-charter-history__sub">
                Mula sa Pamana ng Epitome Hanggang sa Pagkakatatag at Paglago ng Ang Himaya
              </p>
            </div>

            <div className="tfm-charter-history__body">
              <div className="tfm-charter-history__col">
                <p>
                  Nagsisimula ang kuwento ng Ang Himaya Publication sa pagbabago ng tanawing panoraw ng pamamahayagang mag-aaral sa PUP Lopez Kampus.
                </p>
                <p>
                  Bago pa dumating ang Ang Himaya, hinubog ng komunidad ng Unibersidad ang <strong>Epitome</strong>, isang pamahayagang mag-aaral na umibra ng mga 22 taon na ang nakalipas. Sa mga huling taon nito, naging kaugnay ng Epitome ang aktibismo ng mga mag-aaral at ang matinding diskusyon sa kampus. Ang pagkawala nito ay nagdulot ng malaking puwang sa campus press, na nagresulta sa mahabang panahon na walang itinatag na pamahayagang mag-aaral.
                </p>
                <p>
                  Ipinakita ng panahong ito ang pagbabago sa kasaysayan ng pamamahayagang mag-aaral sa PUP Lopez. Dahil walang pamahayagan, ilang taon ang dapat daanan bago lumitaw ang bagong student press na muling magbibigay ng plataporma para sa balita ng kampus, mga pananaw ng mag-aaral, at matinding diskusyon.
                </p>
              </div>

              <div className="tfm-charter-history__col">
                <p>
                  Sa <strong>Akademikong Taon 2024–2025</strong>, itinatag ang Ang Himaya Publication bilang bagong kabanata sa tradisyon ng pamamahayagang mag-aaral ng Unibersidad.
                </p>
                <p>
                  Nagsimula sa <strong>10 kasapi</strong>, nagsimulang magtrabaho ang Ang Himaya bilang opisyal na pamahayagang mag-aaral ng Politeknikong Unibersidad ng Pilipinas – Kampus ng Lopez. Bagama't nagmana ito sa mas malawak na tradisyon ng pamamahayagang mag-aaral, nagtatag ito ng sarili nitong pagkakakilanlan, prinsipyo, at pundasyong organisasyonal.
                </p>
                <p>
                  Sa mga sumunod na akademikong taon, patuloy na lumago ang Pambansang ito. Lumaki ang bilang ng kasapi, lumawak ang saklaw, at dumagdag ang pakikilahok nito sa pamamahayagan at sa mga gawain ng Unibersidad.
                </p>
                <p>
                  Sa <strong>Akademikong Taon 2026–2027</strong>, umabot sa mga <strong>40 kasapi</strong> ang Ang Himaya—isang makabuluhang paglago mula sa orihinal nitong sampung kasapi.
                </p>
              </div>
            </div>

            <div className="tfm-charter-history__credo">
              <p>
                Ngayon, patuloy na binubuo ng Ang Himaya ang sarili nitong kasaysayang institusyonal, habang kinikilala ang lugar ng Epitome sa naunang tradisyon ng pamamahayagang mag-aaral sa PUP Lopez. Ipinapakita ng Pambansang ito ang pangunahing tungkulin ng campus press: magpaalam, magtanong, magtala, at maglingkod sa komunidad ng Unibersidad sa pamamagitan ng responsableng at malayang pamamahayagan.
              </p>
              <blockquote className="tfm-charter-history__quote">
                “Mula sa pamana ng nakaraan patungo sa boses ng bagong henerasyon, patuloy na isinusulat ng Ang Himaya ang susunod na kabanata ng pamamahayagang mag-aaral sa PUP Lopez.”
              </blockquote>
            </div>
          </section>

          </Reveal>
      </div>
    </section>
  );
}

export default Masthead;
