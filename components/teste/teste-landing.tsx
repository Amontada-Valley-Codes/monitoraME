import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BarChart3, ChevronDown, Layers3, Play, Search, UsersRound } from "lucide-react";
import { testeContent as c } from "./content";
import { MunicipalitySearch } from "./municipality-search";

const icons = {
  search: Search,
  chart: BarChart3,
  layers: Layers3,
  users: UsersRound,
};

export function TesteLanding() {
  return (
    <div className="teste-page" id="inicio">
      {/* Cabeçalho */}
      <header className="teste-header">
        <div className="teste-container teste-header-inner">
          <a className="teste-brand" href="#inicio" aria-label="MonitoraME, início">
            <Image
              src="/brand/default-text-dark.svg"
              alt="MonitoraME"
              width={176}
              height={22}
              priority
            />
          </a>

          <nav className="teste-nav" aria-label="Navegação da página de demonstração">
            {c.nav.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
                {"dropdown" in item && item.dropdown && <ChevronDown size={12} aria-hidden="true" />}
              </a>
            ))}
          </nav>

          <a className="teste-button teste-header-cta" href="#solucoes">
            {c.headerCta}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main>
        {/* Seção Hero */}
        <section className="teste-hero" aria-labelledby="teste-hero-title">
          <div className="teste-container teste-hero-grid">
            <div className="teste-hero-copy">
              <h1 id="teste-hero-title">{c.hero.title}</h1>
              <p>{c.hero.description}</p>
              
              <div className="teste-actions">
                <Link className="teste-button" href="/oportunidades">
                  {c.hero.cta}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
                <a className="teste-play-link" href="#sobre">
                  <span>
                    <Play size={15} fill="currentColor" aria-hidden="true" />
                  </span>
                  {c.hero.play}
                </a>
              </div>
            </div>

            <div className="teste-hero-art">
              <div className="teste-orange-disc" aria-hidden="true" />
              <Image
                className="teste-hero-person"
                src="/persons/xdavid.png"
                alt="Profissional com computador"
                fill
                sizes="(max-width: 700px) 85vw, 47vw"
                priority
              />
              
              <div className="teste-float teste-float-left">
                <span className="teste-float-icon">
                  <BarChart3 size={19} />
                </span>
                <span>
                  <strong>{c.hero.leftCard.value}</strong>
                  <small>{c.hero.leftCard.label}</small>
                </span>
              </div>

              <div className="teste-float teste-float-top">
                <span className="teste-float-icon">
                  <UsersRound size={18} />
                </span>
                <span>
                  <strong>{c.hero.topCard.value}</strong>
                  <small>{c.hero.topCard.label}</small>
                </span>
              </div>

              <div className="teste-float teste-float-chart">
                <small>{c.hero.chartLabel}</small>
                <div className="teste-bars" aria-hidden="true">
                  {[37, 61, 43, 76, 55, 91].map((height, i) => (
                    <i key={i} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="teste-container teste-social-wrap">
            <div className="teste-social">
              <h2>{c.social.title}</h2>
              <div className="teste-logo-row">
                {c.social.logos.map((logo, i) => (
                  <span className="teste-logo-placeholder" key={logo}>
                    <span className="teste-logo-mark" aria-hidden="true">
                      {["◈", "▣", "◇", "✣", "⬡", "≋"][i]}
                    </span>
                    {logo}
                  </span>
                ))}
              </div>
              <MunicipalitySearch />
            </div>
          </div>
        </section>

        {/* Seção Sobre */}
        <section className="teste-section teste-about" id="sobre" aria-labelledby="teste-about-title">
          <div className="teste-container teste-about-grid">
            <div className="teste-about-art">
              <div className="teste-about-blob">
                <Image
                  src="/persons/valley-team.png"
                  alt="Pessoas colaborando em equipe"
                  fill
                  sizes="(max-width: 700px) 90vw, 40vw"
                />
              </div>
              <div className="teste-seal">
                <strong>{c.about.sealValue}</strong>
                <span>{c.about.sealLabel}</span>
              </div>
            </div>

            <div className="teste-about-copy">
              <span className="teste-eyebrow">{c.about.eyebrow}</span>
              <h2 id="teste-about-title">{c.about.title}</h2>
              <p>{c.about.description}</p>
              
              <div className="teste-about-items">
                {c.about.items.map((item, i) => (
                  <div className="teste-about-item" key={item.title}>
                    <span className="teste-item-icon">
                      {i === 0 ? <BarChart3 size={22} /> : <Layers3 size={22} />}
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção Soluções / Serviços */}
        <section className="teste-section teste-services" id="solucoes" aria-labelledby="teste-services-title">
          <div className="teste-container">
            <div className="teste-section-heading">
              <span className="teste-eyebrow">{c.services.eyebrow}</span>
              <h2 id="teste-services-title">{c.services.title}</h2>
            </div>

            <div className="teste-service-grid">
              {c.services.items.map((item, i) => {
                const Icon = icons[item.icon];
                return (
                  <article
                    className={`teste-service-card ${i === 0 ? "teste-service-featured" : ""}`}
                    key={item.title}
                  >
                    <span className="teste-service-icon">
                      <Icon size={23} strokeWidth={1.8} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Seção Resultados */}
        <section className="teste-results" id="resultados" aria-labelledby="teste-results-title">
          <div className="teste-mosaic" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i}>
                <Image
                  src={`/persons/${["xdavid.png", "mario-adriano.png", "valley-team.png"][i % 3]}`}
                  alt=""
                  fill
                  sizes="25vw"
                />
              </div>
            ))}
          </div>

          <div className="teste-results-overlay" />

          <div className="teste-container teste-results-content">
            <h2 id="teste-results-title">{c.results.title}</h2>
            <p>{c.results.description}</p>
            
            <div className="teste-metrics">
              {c.results.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="teste-footer" id="contato">
        <div className="teste-container">
          <div className="teste-footer-grid">
            <div className="teste-footer-brand">
              <a href="#inicio" aria-label="MonitoraME, voltar ao início">
                <Image src="/brand/light-horizontal-logo.svg" alt="MonitoraME" width={185} height={23} />
              </a>
              <p>{c.footer.tagline}</p>
            </div>

            {c.footer.groups.map((group) => (
              <div className="teste-footer-group" key={group.title}>
                <h2>{group.title}</h2>
                {group.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="teste-footer-bottom">
            <small>{c.footer.copyright}</small>
            <div className="teste-footer-social" aria-label="Redes sociais (ilustração)">
              {c.footer.social.map((item) => (
                <span title={`${item.label} — ilustrativo`} key={item.label}>
                  {item.glyph}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
