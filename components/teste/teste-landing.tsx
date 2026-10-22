import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BarChart3, BriefcaseBusiness, ChevronDown, Database, Landmark, Layers3, MapPinned, Network, Play, Search, SearchCheck, TrendingUp, UsersRound } from "lucide-react";
import { testeContent as c } from "./content";
import { MunicipalitySearch } from "./municipality-search";

const icons = {
  search: Search,
  chart: BarChart3,
  layers: Layers3,
  users: UsersRound,
};

const socialIcons = [BriefcaseBusiness, Landmark, Database, SearchCheck, MapPinned, Network];

export function Landing() {
  return (
    <div className="landing-page" id="inicio">
      {/* Cabeçalho */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <a className="landing-brand" href="#inicio" aria-label="MonitoraME, início">
            <Image
              src="/brand/default-text-dark.svg"
              alt="MonitoraME"
              width={176}
              height={22}
              priority
            />
          </a>

          <nav className="landing-nav" aria-label="Navegação da página de demonstração">
            {c.nav.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
                {"dropdown" in item && item.dropdown && <ChevronDown size={12} aria-hidden="true" />}
              </a>
            ))}
          </nav>

          <a className="landing-button landing-header-cta" href="#solucoes">
            {c.headerCta}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main>
        {/* Seção Hero */}
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <h1 id="landing-hero-title">{c.hero.title}</h1>
              <p>{c.hero.description}</p>
              
              <div className="landing-actions p-6">
                <Link className="landing-button" href="/oportunidades">
                  {c.hero.cta}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
                <a className="landing-play-link" href="#sobre">
                  <span>
                    <Play size={15} fill="currentColor" aria-hidden="true" />
                  </span>
                  {c.hero.play}
                </a>
              </div>
            </div>

            <div className="landing-hero-art">
              <div className="landing-orange-disc" aria-hidden="true" />
              <Image
                className="landing-hero-person"
                src="/persons/xdavid.png"
                alt="Profissional com computador"
                fill
                sizes="(max-width: 700px) 85vw, 47vw"
                priority
              />
            

              <div className="landing-float landing-float-chart">
                <small>{c.hero.chartLabel}</small>
                <div className="landing-bars" aria-hidden="true">
                  {[37, 61, 43, 76, 55, 91].map((height, i) => (
                    <i key={i} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="landing-container pt-8 landing-social-wrap">
            <div className="landing-social">
              {/* <h2>{c.social.title}</h2> */}
              <div className="landing-logo-row">
                {c.social.logos.map((logo, i) => {
                  const SocialIcon = socialIcons[i];
                  return (
                    <span className="landing-logo-placeholder" key={logo}>
                      <span className="landing-logo-mark" aria-hidden="true"><SocialIcon /></span>
                      <span className="landing-logo-label">{logo}</span>
                    </span>
                  );
                })}
              </div>
              <MunicipalitySearch />
            </div>
          </div>
        </section>

        {/* Seção Sobre */}
        <section className="landing-section landing-about" id="sobre" aria-labelledby="landing-about-title">
          <div className="landing-container landing-about-grid">
            <div className="landing-about-art">
              <div className="landing-about-blob">
                <Image
                  src="/persons/valley-team.png"
                  alt="Pessoas colaborando em equipe"
                  fill
                  sizes="(max-width: 700px) 90vw, 40vw"
                />
              </div>
              <div className="landing-seal">
                <strong>{c.about.sealValue}</strong>
                <span>{c.about.sealLabel}</span>
              </div>
            </div>

            <div className="landing-about-copy">
              <span className="landing-eyebrow">{c.about.eyebrow}</span>
              <h2 id="landing-about-title">{c.about.title}</h2>
              <p>{c.about.description}</p>
              
              <div className="landing-about-items">
                {c.about.items.map((item, i) => (
                  <div className="landing-about-item" key={item.title}>
                    <span className="landing-item-icon">
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
        <section className="landing-section landing-services" id="solucoes" aria-labelledby="landing-services-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <span className="landing-eyebrow">{c.services.eyebrow}</span>
              <h2 id="landing-services-title">{c.services.title}</h2>
            </div>

            <div className="landing-service-grid">
              {c.services.items.map((item, i) => {
                const Icon = icons[item.icon];
                return (
                  <article
                    className={`landing-service-card ${i === 0 ? "landing-service-featured" : ""}`}
                    key={item.title}
                  >
                    <span className="landing-service-icon">
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

        {/* Seção Módulo Analítico */}
        <section className="landing-analytics" id="analitico" aria-labelledby="landing-analytics-title">
          <div className="landing-container landing-analytics-grid">
            <div className="landing-analytics-copy">
              <span className="landing-eyebrow">{c.analytics.eyebrow}</span>
              <h2 id="landing-analytics-title">{c.analytics.title}</h2>
              <p>{c.analytics.description}</p>

              <div className="landing-analytics-highlights">
                {c.analytics.highlights.map((highlight) => (
                  <article key={highlight.title}>
                    <span aria-hidden="true"><TrendingUp size={18} /></span>
                    <div>
                      <h3>{highlight.title}</h3>
                      <p>{highlight.description}</p>
                    </div>
                  </article>
                ))}
              </div>

              <Link className="landing-button landing-analytics-cta" href="/analitico">
                {c.analytics.cta}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="landing-analytics-visual">
              <div className="landing-analytics-halo" aria-hidden="true" />
              <Image
                className="landing-analytics-people"
                src="/persons/mario-adriano.png"
                alt="Profissionais que representam a análise de dados para decisões públicas"
                fill
                sizes="(max-width: 700px) 92vw, 48vw"
              />
            </div>
          </div>
        </section>

        {/* Seção Resultados */}
        <section className="landing-results" id="resultados" aria-labelledby="landing-results-title">
          <div className="landing-mosaic" aria-hidden="true">
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

          <div className="landing-results-overlay" />

          <div className="landing-container landing-results-content">
            <h2 id="landing-results-title">{c.results.title}</h2>
            <p>{c.results.description}</p>
            
            <div className="landing-metrics">
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
      <footer className="landing-footer" id="contato">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <a href="#inicio" aria-label="MonitoraME, voltar ao início">
                <Image src="/brand/light-horizontal-logo.svg" alt="MonitoraME" width={185} height={23} />
              </a>
            </div>

            {c.footer.groups.map((group) => (
              <div className="landing-footer-group" key={group.title}>
                <h2>{group.title}</h2>
                {group.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="landing-footer-bottom">
            <small>{c.footer.copyright}</small>
            <div className="landing-footer-social" aria-label="Redes sociais (ilustração)">
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
