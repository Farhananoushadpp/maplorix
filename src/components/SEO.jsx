import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogUrl, 
  canonicalUrl,
  type = 'website',
  structuredData = null
}) => {
  const defaultTitle = 'Maplorix - Leading Recruitment Agency | Find Jobs & Hire Talent'
  const defaultDescription = 'Maplorix is a leading job recruitment agency connecting talented professionals with top employers. Search jobs, upload resume, get career counseling, and hire the best talent.'
  const defaultKeywords = 'recruitment agency, job search, career counseling, resume building, interview preparation, talent acquisition, staffing solutions'
  const siteUrl = 'https://www.maplorix.com'
  
  const pageTitle = title ? `${title} | Maplorix` : defaultTitle
  const pageDescription = description || defaultDescription
  const pageKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords
  const pageImage = ogImage || `${siteUrl}/maplorix.svg`
  const pageUrl = ogUrl || siteUrl
  const pageCanonical = canonicalUrl || siteUrl

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content="Maplorix Recruitment Agency" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={pageCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:alt" content="Maplorix Recruitment Agency" />
      <meta property="og:site_name" content="Maplorix" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={pageImage} />
      <meta property="twitter:image:alt" content="Maplorix Recruitment Agency" />

      {/* Additional SEO */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
