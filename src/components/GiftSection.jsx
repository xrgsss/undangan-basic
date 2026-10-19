import { motion } from 'framer-motion'
import { weddingConfig } from '../data/weddingConfig'
import { buildWhatsappUrl } from '../lib/utils'
import Button from './Button'
import CopyField from './CopyField'
import Icon from './Icon'
import SectionShell from './SectionShell'
import SectionHeading from './SectionHeading'
import { Reveal, Stagger, StaggerItem } from './Motion'

/* ============================================================================
 *  GiftSection — informasi hadiah pernikahan (angka rekening / e-wallet).
 *  Semua data diambil dari weddingConfig.gift. Bila `enabled: false`, section
 *  ini tidak dirender sama sekali (lihat App.jsx).
 * ========================================================================== */
export default function GiftSection() {
  const gift = weddingConfig.gift
  const whatsappUrl = gift.confirmWhatsapp ? buildWhatsappUrl(gift.confirmWhatsapp, gift.confirmMessage) : ''
  const address = gift.address
  const addressText = address?.enabled
    ? `${address.recipient}, ${address.lines.join(', ')}${address.phone ? ` (${address.phone})` : ''}`
    : ''

  return (
    <SectionShell id="gift" ornament ornamentPosition="top-right" labelledBy="gift-title">
      <SectionHeading eyebrow="Tanda Kasih" title={gift.title} subtitle={gift.subtitle} titleId="gift-title" />

      <Reveal delay={0.1} className="mt-8">
        <p className="mx-auto max-w-2xl text-center text-[13px] leading-relaxed text-cocoa-400 sm:text-sm">{gift.intro}</p>
      </Reveal>

      {gift.accounts?.length ? (
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
          {gift.accounts.map((account, index) => (
            <StaggerItem key={`${account.provider}-${account.accountNumber}`} className="h-full min-w-0">
              <motion.article
                className="paper-card relative flex h-full flex-col overflow-hidden rounded-3xl px-5 pb-5 pt-6"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  className="absolute inset-x-6 top-0 h-px"
                  style={{
                    backgroundImage: `linear-gradient(90deg, transparent, ${account.color || '#B9955B'}, transparent)`,
                  }}
                  aria-hidden="true"
                />

                <div className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full border"
                    style={{
                      borderColor: `${account.color || '#B9955B'}55`,
                      color: account.color || '#B9955B',
                      background: `${account.color || '#B9955B'}12`,
                    }}
                    aria-hidden="true"
                  >
                    <Icon name="bank" size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[15px] text-cocoa">{account.provider}</p>
                    <p className="truncate font-sans text-[10px] uppercase tracking-[0.16em] text-cocoa-300">
                      {account.accountName}
                    </p>
                  </div>
                </div>

                <CopyField
                  className="mt-5"
                  label="Nomor Rekening"
                  value={account.accountNumber}
                  group
                  copyLabel="Salin"
                  toastMessage={`Nomor ${account.provider} berhasil disalin`}
                />

                <p className="mt-4 text-[10px] leading-relaxed text-cocoa-300">
                  Mohon konfirmasi melalui WhatsApp setelah melakukan transfer agar kami dapat mencatatnya.
                </p>

                <span className="mt-auto pt-3 font-sans text-[9px] uppercase tracking-[0.2em] text-cocoa-300/80">
                  {String(index + 1).padStart(2, '0')} · {weddingConfig.meta.hashtag}
                </span>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {address?.enabled ? (
          <Reveal delay={0.1} className="h-full min-w-0">
            <div className="paper-card flex h-full flex-col rounded-3xl px-5 py-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-champagne/40 bg-champagne/10 text-champagne-700" aria-hidden="true">
                  <Icon name="gift" size={17} />
                </span>
                <div>
                  <p className="font-display text-[15px] text-cocoa">Kirim Kado</p>
                  <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-cocoa-300">Alamat pengiriman</p>
                </div>
              </div>

              <div className="mt-5 flex-1">
                <p className="font-display text-base text-cocoa">{address.recipient}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-cocoa-400">{address.lines.join(', ')}</p>
                {address.phone ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-cocoa-400">
                    <Icon name="phone" size={13} className="text-champagne-600" />
                    {address.phone}
                  </p>
                ) : null}
              </div>

              <CopyField
                className="mt-5"
                label="Alamat Pengiriman Kado"
                value={addressText}
                monospace={false}
                toastMessage="Alamat berhasil disalin"
              />
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.18} className="h-full min-w-0">
          <div className="paper-card flex h-full flex-col items-center justify-center rounded-3xl px-5 py-6 text-center">
            <Icon name="heartHandshake" size={24} className="text-champagne-600" />
            <p className="mt-3 font-display text-lg text-cocoa">Doa Anda yang Terutama</p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-cocoa-400">
              Hadiah bukanlah kewajiban. Kami lebih menghargai doa restu dan kehadiran Anda di hari bahagia kami.
            </p>

            {whatsappUrl ? (
              <Button
                className="mt-5"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                icon="message"
                aria-label="Konfirmasi pengiriman hadiah melalui WhatsApp"
              >
                Konfirmasi via WhatsApp
              </Button>
            ) : null}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
