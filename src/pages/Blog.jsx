import React from 'react';
import './Blog.css';

const FEED_JSON_URL = 'https://rss.app/feeds/v1.1/lfgjxjxjR77qIpL0.json';

function cleanText(item) {
  var raw = item.content_text || item.description || '';
  return raw.replace(/https?:\/\/lnkd\.in\/\S+/g, '').trim();
}

function firstLine(text) {
  var line = text.split('\n')[0].trim();
  return line.length > 90 ? line.slice(0, 90).trim() + '...' : line;
}

function mapFeedItem(item, i) {
  var full = cleanText(item);
  var link = item.url || item.link || '';
  if (link && link.indexOf('http') !== 0) link = 'https://' + link;
  var img = item.image || (item.attachments && item.attachments[0] && item.attachments[0].url) || null;
  return {
    id: item.id || item.guid || i,
    title: firstLine(item.title || full || 'Insight Genesis Update'),
    fullText: full,
    excerpt: full.slice(0, img ? 150 : 300).trim() + (full.length > (img ? 150 : 300) ? '...' : ''),
    date: item.date_published
      ? new Date(item.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '',
    image: img,
    url: link || null
  };
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openPost, setOpenPost] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    fetch(FEED_JSON_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Feed not reachable');
        return res.json();
      })
      .then(function (data) {
        var items = data.items || [];
        if (active && items.length > 0) setBlogPosts(items.map(mapFeedItem));
      })
      .catch(function (e) { console.warn('Blog: feed error -', e.message); })
      .finally(function () { if (active) setLoading(false); });
    return function () { active = false; };
  }, []);

  var featured = blogPosts[0];
  var rest = blogPosts.slice(1);

  return (
    <div className="ig-blog">
      <header className="ig-blog-hero">
        <p className="ig-blog-eyebrow">FROM THE TEAM</p>
        <h1 className="ig-blog-heading">Insight Genesis Blog</h1>
        <p className="ig-blog-sub">Insights on AI, data, and the future of human intelligence.</p>
      </header>

      {loading && <p className="ig-blog-loading">Loading posts...</p>}

      {!loading && featured && (
        <div
          className={'ig-blog-featured' + (featured.image ? '' : ' no-image')}
          onClick={function () { setOpenPost(featured); }}
        >
          {featured.image && (
            <div className="ig-blog-featured-media">
              <img src={featured.image} alt={featured.title} />
            </div>
          )}
          <div className="ig-blog-featured-body">
            <span className="ig-blog-tag">Featured</span>
            <h2 className="ig-blog-featured-title">{featured.title}</h2>
            <p className="ig-blog-featured-excerpt">{featured.excerpt}</p>
            <div className="ig-blog-meta">
              <span className="ig-blog-date">{featured.date}</span>
              <span className="ig-blog-readmore">Read article &rarr;</span>
            </div>
          </div>
        </div>
      )}

      <div className="ig-blog-grid">
        {rest.map(function (post) {
          return (
            <div
              key={post.id}
              className={'ig-blog-card' + (post.image ? '' : ' no-image')}
              onClick={function () { setOpenPost(post); }}
            >
              {post.image && (
                <div className="ig-blog-card-media">
                  <img src={post.image} alt={post.title} />
                </div>
              )}
              <div className="ig-blog-card-body">
                <h3 className="ig-blog-card-title">{post.title}</h3>
                <p className="ig-blog-card-excerpt">{post.excerpt}</p>
                <div className="ig-blog-meta">
                  <span className="ig-blog-date">{post.date}</span>
                  <span className="ig-blog-readmore">Read &rarr;</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {openPost && (
        <div className="ig-modal-overlay" onClick={function () { setOpenPost(null); }}>
          <div className="ig-modal" onClick={function (e) { e.stopPropagation(); }}>
            <button className="ig-modal-close" onClick={function () { setOpenPost(null); }} aria-label="Close">
              <span>&times;</span>
            </button>
            {openPost.image && (
              <div className="ig-modal-media">
                <img src={openPost.image} alt={openPost.title} />
              </div>
            )}
            <div className="ig-modal-body">
              <span className="ig-blog-date">{openPost.date}</span>
              <h2 className="ig-modal-title">{openPost.title}</h2>
              <div className="ig-modal-text">
                {openPost.fullText.split('\n').map(function (para, idx) {
                  if (!para.trim()) return null;
                  return <p key={idx}>{para}</p>;
                })}
              </div>
              {openPost.url && (
                <a className="ig-modal-link" href={openPost.url} target="_blank" rel="noopener noreferrer">
                  View original on LinkedIn &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
