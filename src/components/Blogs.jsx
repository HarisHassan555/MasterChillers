import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import Footer from './Footer';

const sortByCreatedAtDesc = (items) =>
  [...items].sort((a, b) => {
    const aMillis = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bMillis = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bMillis - aMillis;
  });

const getCoverImage = (blog) => {
  if (blog.coverImage?.trim()) {
    return blog.coverImage.trim();
  }

  if (!blog.content) {
    return '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(blog.content, 'text/html');
  const firstImage = doc.querySelector('img');
  return firstImage?.getAttribute('src') || '';
};

const sanitizeBlogHtml = (html) =>
  DOMPurify.sanitize(html || '', {
    ADD_TAGS: ['iframe', 'video', 'source'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'src',
      'type',
      'controls',
      'autoplay',
      'muted',
      'loop',
      'playsinline',
      'width',
      'height'
    ]
  });

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setError(null);
        let blogsSnapshot;

        try {
          const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
          blogsSnapshot = await getDocs(blogsQuery);
        } catch (queryError) {
          if (queryError?.code !== 'permission-denied') {
            blogsSnapshot = await getDocs(collection(db, 'blogs'));
          } else {
            throw queryError;
          }
        }

        const publishedBlogs = sortByCreatedAtDesc(
          blogsSnapshot.docs
            .map((blogDoc) => ({
              id: blogDoc.id,
              ...blogDoc.data()
            }))
            .filter((blog) => blog.published)
        );

        setBlogs(publishedBlogs);
      } catch (fetchError) {
        console.error('Error loading blogs:', fetchError);
        if (fetchError?.code === 'permission-denied') {
          setError('Blogs cannot be read yet. Deploy Firestore rules to allow public read on "blogs".');
          return;
        }
        setError('Failed to load blogs.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const selectedBlogId = searchParams.get('blog');
  const selectedBlog = useMemo(
    () => blogs.find((blog) => blog.id === selectedBlogId) || null,
    [blogs, selectedBlogId]
  );

  const openBlog = (blogId) => {
    setSearchParams({ blog: blogId });
  };

  const backToList = () => {
    setSearchParams({});
  };

  return (
    <>
      <section className="min-h-screen bg-slate-900 text-white px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {selectedBlog ? (
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={backToList}
                className="text-sm text-red-400 hover:text-red-300 font-medium bg-slate-900/85 border border-slate-700 rounded-md px-3 py-2 backdrop-blur-sm"
              >
                Back to all blogs
              </button>
              <Link
                to="/"
                className="text-sm text-red-400 hover:text-red-300 font-medium bg-slate-900/85 border border-slate-700 rounded-md px-3 py-2 backdrop-blur-sm"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold">Blogs</h1>
              <Link to="/" className="text-red-400 hover:text-red-300 font-medium">
                Back to Home
              </Link>
            </div>
          )}

          {loading && <p className="text-gray-400">Loading blog posts...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && blogs.length === 0 && (
            <p className="text-gray-400">No blog posts are published yet.</p>
          )}

          {!loading && !error && selectedBlog && (
            <article className="max-w-6xl mx-auto">
              {getCoverImage(selectedBlog) && (
                <img
                  src={getCoverImage(selectedBlog)}
                  alt={selectedBlog.title}
                  className="w-full max-h-[520px] object-cover rounded-xl mb-6"
                />
              )}

              <h2 className="text-4xl font-bold mb-3">{selectedBlog.title}</h2>
              {selectedBlog.summary && <p className="text-gray-300 mb-7 text-lg">{selectedBlog.summary}</p>}
              <div
                className="blog-content text-gray-100 leading-relaxed text-[1.04rem]"
                dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(selectedBlog.content) }}
              />
            </article>
          )}

          {!loading && !error && !selectedBlog && (
            <div className="space-y-6">
              {blogs.map((blog) => {
                const coverImage = getCoverImage(blog);
                return (
                  <article
                    key={blog.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 md:p-6 cursor-pointer hover:border-red-500/60 transition-colors"
                    onClick={() => openBlog(blog.id)}
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {coverImage && (
                        <img
                          src={coverImage}
                          alt={blog.title}
                          className="w-full md:w-72 h-44 object-cover rounded-lg border border-slate-700"
                        />
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>
                        {blog.summary && <p className="text-gray-300 mb-4">{blog.summary}</p>}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openBlog(blog.id);
                          }}
                          className="text-red-400 hover:text-red-300 font-medium"
                        >
                          Read full blog
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Blogs;
