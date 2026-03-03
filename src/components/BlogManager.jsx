import React, { useEffect, useMemo, useState } from 'react';
import JoditEditor from 'jodit-react';
import 'jodit/es2021/jodit.min.css';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

const sortByCreatedAtDesc = (items) =>
  [...items].sort((a, b) => {
    const aMillis = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bMillis = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bMillis - aMillis;
  });

const BlogManager = () => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [coverFileName, setCoverFileName] = useState('');

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 420,
      toolbarAdaptive: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      buttons:
        'source,|,bold,italic,underline,strikethrough,|,font,fontsize,brush,paragraph,|,ul,ol,indent,outdent,|,table,link,image,video,|,align,undo,redo,|,hr,eraser,fullsize',
      uploader: {
        insertImageAsBase64URI: true
      }
    }),
    []
  );

  const fetchBlogs = async () => {
    try {
      setError(null);
      let blogsSnapshot;
      try {
        const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        blogsSnapshot = await getDocs(blogsQuery);
      } catch (queryError) {
        blogsSnapshot = await getDocs(collection(db, 'blogs'));
      }

      const blogItems = sortByCreatedAtDesc(
        blogsSnapshot.docs.map((blogDoc) => {
          const blogData = blogDoc.data();
          return {
            id: blogDoc.id,
            ...blogData
          };
        })
      );
      setBlogs(blogItems);
    } catch (fetchError) {
      console.error('Error fetching blogs:', fetchError);
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setCoverImage('');
    setContent('');
    setEditingBlogId(null);
    setCoverFileName('');
  };

  const handleCoverFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please attach a valid image file for cover photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(typeof reader.result === 'string' ? reader.result : '');
      setCoverFileName(selectedFile.name);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read selected cover image.');
    };
    reader.readAsDataURL(selectedFile);
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingBlogId) {
        await updateDoc(doc(db, 'blogs', editingBlogId), {
          title: title.trim(),
          summary: summary.trim(),
          coverImage: coverImage.trim(),
          content,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'blogs'), {
          title: title.trim(),
          summary: summary.trim(),
          coverImage: coverImage.trim(),
          content,
          published: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      resetForm();
      await fetchBlogs();
    } catch (publishError) {
      console.error('Error publishing blog:', publishError);
      if (publishError?.code === 'permission-denied') {
        setError('Publish blocked by Firestore rules. Ensure authenticated write access to "blogs".');
        return;
      }
      setError(editingBlogId ? 'Failed to update blog.' : 'Failed to publish blog.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (blog) => {
    setEditingBlogId(blog.id);
    setTitle(blog.title || '');
    setSummary(blog.summary || '');
    setCoverImage(blog.coverImage || '');
    setContent(blog.content || '');
    setCoverFileName(blog.coverImage ? 'Attached cover image' : '');
    setError(null);
  };

  const togglePublish = async (blogId, currentState) => {
    try {
      await updateDoc(doc(db, 'blogs', blogId), {
        published: !currentState,
        updatedAt: serverTimestamp()
      });
      await fetchBlogs();
    } catch (toggleError) {
      console.error('Error updating blog state:', toggleError);
      setError('Failed to update blog status.');
    }
  };

  const removeBlog = async (blogId) => {
    try {
      await deleteDoc(doc(db, 'blogs', blogId));
      await fetchBlogs();
    } catch (deleteError) {
      console.error('Error deleting blog:', deleteError);
      setError('Failed to delete blog.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white mb-4">Create Blog</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg bg-white border border-slate-400 px-3 py-2 text-black focus:outline-none focus:border-red-500"
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Summary</label>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={3}
              className="w-full rounded-lg bg-white border border-slate-400 px-3 py-2 text-black focus:outline-none focus:border-red-500"
              placeholder="Short description for the /blogs listing"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Cover Photo Attachment</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="w-full rounded-lg bg-white border border-slate-400 px-3 py-2 text-black file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-slate-800"
            />
            {coverFileName && <p className="text-xs text-gray-400 mt-2">Attached: {coverFileName}</p>}
            {coverImage && (
              <div className="mt-3">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full max-w-sm h-40 object-cover rounded-lg border border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setCoverFileName('');
                  }}
                  className="mt-2 text-sm text-red-400 hover:text-red-300"
                >
                  Remove cover photo
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Content</label>
            <div className="rounded-lg overflow-hidden border border-slate-700">
              <JoditEditor
                value={content}
                config={editorConfig}
                onBlur={(newValue) => setContent(newValue)}
                onChange={() => {}}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="flex justify-end gap-3">
            {editingBlogId ? (
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Cancel Edit
              </button>
            ) : (
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
            >
              {saving ? (editingBlogId ? 'Updating...' : 'Publishing...') : editingBlogId ? 'Update Blog' : 'Publish Blog'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white mb-4">Existing Blogs</h2>

        {loading ? (
          <div className="text-gray-400">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="text-gray-400">No blogs found.</div>
        ) : (
          <div className="space-y-3">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <h3 className="text-white font-semibold">{blog.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{blog.summary || 'No summary'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(blog)}
                    className="px-3 py-1.5 rounded-md text-sm bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => togglePublish(blog.id, blog.published)}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      blog.published
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {blog.published ? 'Published' : 'Draft'}
                  </button>
                  <button
                    onClick={() => removeBlog(blog.id)}
                    className="px-3 py-1.5 rounded-md text-sm bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
