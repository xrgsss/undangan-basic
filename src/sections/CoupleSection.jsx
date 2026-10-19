import { motion, useReducedMotion } from 'framer-motion'
import { weddingConfig } from '../data/weddingConfig'
import SectionShell from '../components/SectionShell'
import SectionHeading from '../components/SectionHeading'
import Icon from '../components/Icon'
import { LeafSpray, Rose } from '../components/FloralDecoration'
import { Reveal } from '../components/Motion'

/* ============================================================================
 *  CoupleSection — profil kedua mempelai (desain simetris).
 *  • Foto muncul dengan scale-in + fade.
 *  • Di desktop kedua profil masuk dari arah berlawanan; di mobile tersusun
 *    vertikal agar mudah dibaca.
 * ========================================================================== */

function CoupleProfile({ person, role, from = 'left' }) {
  const reduce = useReducedMotion()
  const offset = from === 'left' ? -70 : 70

  return (
    <motion.article
      className="flex flex-col items-center text-center"
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: offset, y: 24 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="font-sans text-[10px] font-bold uppercase tracking-[0.34em] text-champagne-600">{role}</p>

      <div className="relative mt-5">
        {/* Bingkai oval emas */}
        <div className="relative h-[15rem] w-[11.6rem] overflow-hidden rounded-[50%] border border-champagne/55 bg-ivory-100 p-1 shadow-card sm:h-[18.5rem] sm:w-[14.2rem]">
          <div className="h-full w-full overflow-hidden rounded-[50%]">
            <motion.img
              src={person.photo}
              alt={`Foto ${person.fullName}, ${role.toLowerCase()}`}
              width={900}
              height={1125}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              onError={(event) => {
                // Jangan tampilkan gambar rusak: ganti dengan latar netral.
                event.currentTarget.style.visibility = 'hidden'
              }}
            />
          </div>
          <span className="pointer-events-none absolute inset-0 rounded-[50%] shadow-[inset_0_0_28px_rgba(91,80,68,0.14)]" aria-hidden="true" />
        </div>

        {/* Ornamen bunga kecil di sisi foto */}
        <Rose
          size={46}
          tone="blue"
          rotate={-14}
          className="pointer-events-none absolute -bottom-3 -left-5 animate-float-slow sm:-left-7"
        />
        <LeafSpray
          size={70}
          rotate={-28}
          opacity={0.75}
          className="pointer-events-none absolute -right-8 -top-4 sm:-right-10"
        />
      </div>

      <h3 className="mt-7 font-display text-2xl leading-snug text-cocoa sm:text-[1.7rem]">{person.fullName}</h3>
      <p className="mt-1.5 font-script text-3xl text-gilded sm:text-4xl">{person.nickname}</p>

      <div className="mt-5 max-w-xs space-y-1">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-cocoa-300">{person.childOrder}</p>
        <p className="font-serif text-[15px] leading-relaxed text-cocoa-400 sm:text-base">{person.father}</p>
        <p className="font-serif text-[15px] leading-relaxed text-cocoa-400 sm:text-base">dan {person.mother}</p>
      </div>

      {person.instagram ? (
        <a
          href={`https://instagram.com/${String(person.instagram).replace(/^@/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-champagne/35 bg-white/70 px-3.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-champagne-700 transition-colors hover:bg-white"
          aria-label={`Instagram ${person.nickname}`}
        >
          <Icon name="share" size={12} />
          @{String(person.instagram).replace(/^@/, '')}
        </a>
      ) : null}
    </motion.article>
  )
}

export default function CoupleSection() {
  const { couple } = weddingConfig
  const reduce = useReducedMotion()

  return (
    <SectionShell id="couple" labelledBy="couple-title">
      <SectionHeading
        eyebrow="Bismillahirrahmanirrahim"
        title="Mempelai"
        subtitle="Dengan memohon rahmat Allah SWT, kami mempersembahkan putra-putri kami"
        titleId="couple-title"
      />

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
        <CoupleProfile person={couple.bride} role="Mempelai Wanita" from="left" />

        {/* Simbol & berornamen emas */}
        <div className="relative flex items-center justify-center" aria-hidden="true">
          <div className="flex w-full items-center justify-center gap-4 lg:h-full lg:flex-col">
            <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,#b9955b,transparent)] lg:h-24 lg:w-px lg:flex-none lg:bg-[linear-gradient(180deg,transparent,#b9955b,transparent)]" />
            <motion.span
              className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border border-champagne/45 bg-[radial-gradient(circle_at_35%_30%,#fffdf8,#f0e7d5)] shadow-soft"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -12 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-script text-3xl leading-none text-gilded">&amp;</span>
              <span className="absolute inset-[-6px] rounded-full border border-dashed border-champagne/35" />
            </motion.span>
            <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,#b9955b,transparent)] lg:h-24 lg:w-px lg:flex-none lg:bg-[linear-gradient(180deg,transparent,#b9955b,transparent)]" />
          </div>
        </div>

        <CoupleProfile person={couple.groom} role="Mempelai Pria" from="right" />
      </div>

      <Reveal delay={0.2} className="mt-12">
        <p className="mx-auto max-w-xl text-center font-serif text-[13px] italic leading-relaxed text-cocoa-300">
          {weddingConfig.meta.hashtag} · Kami berbahagia menyambut Anda di hari istimewa kami.
        </p>
      </Reveal>
    </SectionShell>
  )
}
