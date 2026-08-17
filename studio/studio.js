const state = {
  posts: [],
  current: null,
  previousSlug: "",
  dirty: false,
  template: "note",
  renderTimer: null
};

const $ = (selector) => document.querySelector(selector);
const elements = {
  postList: $("#post-list"),
  postCount: $("#post-count"),
  search: $("#post-search"),
  editor: $("#editor"),
  empty: $("#empty-editor"),
  title: $("#title"),
  summary: $("#summary"),
  slug: $("#slug"),
  category: $("#category"),
  tags: $("#tags"),
  difficulty: $("#difficulty"),
  publishedAt: $("#published-at"),
  series: $("#series"),
  part: $("#part"),
  body: $("#body"),
  preview: $("#preview"),
  panels: $("#composer-panels"),
  saveStatus: $("#save-status"),
  wordCount: $("#word-count"),
  save: $("#save-post"),
  publish: $("#publish-post"),
  archive: $("#archive-post"),
  dialog: $("#new-dialog"),
  newForm: $("#new-form"),
  newTitle: $("#new-title"),
  templateList: $("#template-list"),
  imageInput: $("#image-input"),
  toast: $("#toast")
};

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function showToast(message, error = false) {
  elements.toast.textContent = message;
  elements.toast.className = `toast visible${error ? " error" : ""}`;
  window.setTimeout(() => (elements.toast.className = "toast"), 3200);
}

function setDirty(value = true) {
  state.dirty = value;
  if (!state.current) return;
  elements.saveStatus.textContent = value
    ? "Unsaved local changes"
    : state.current.meta.draft
      ? "Draft saved locally"
      : "Published";
}

function renderPostList() {
  const query = elements.search.value.trim().toLowerCase();
  const posts = state.posts.filter((post) =>
    [post.title, post.summary, post.category, ...(post.tags || [])]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
  elements.postCount.textContent = posts.length;
  elements.postList.innerHTML = posts
    .map(
      (post) => `
        <button class="post-item ${state.current?.slug === post.slug ? "active" : ""}" data-slug="${escapeHtml(post.slug)}">
          <span class="post-state ${post.draft ? "draft" : "published"}"></span>
          <span>
            <strong>${escapeHtml(post.title)}</strong>
            <small>${escapeHtml(post.category)} · ${post.words} words</small>
          </span>
        </button>
      `
    )
    .join("");
}

async function loadPosts() {
  const data = await api("/api/posts");
  state.posts = data.posts;
  renderPostList();
}

function fillEditor(post) {
  state.current = post;
  state.previousSlug = post.slug;
  elements.title.value = post.meta.title;
  elements.summary.value = post.meta.summary;
  elements.slug.value = post.slug;
  elements.category.value = post.meta.category;
  elements.tags.value = post.meta.tags.join(", ");
  elements.difficulty.value = post.meta.difficulty;
  elements.publishedAt.value = post.meta.publishedAt;
  elements.series.value = post.meta.series;
  elements.part.value = post.meta.part;
  elements.body.value = post.content;
  elements.empty.classList.add("hidden");
  elements.editor.classList.remove("hidden");
  [elements.save, elements.publish, elements.archive].forEach(
    (button) => (button.disabled = false)
  );
  elements.archive.disabled = post.meta.draft;
  setDirty(false);
  updateWordCount();
  queuePreview();
  renderPostList();
  elements.title.focus();
}

async function openPost(slug, force = false) {
  if (state.dirty && !force) {
    const discard = window.confirm("Discard unsaved changes and open another article?");
    if (!discard) return;
  }
  try {
    fillEditor(await api(`/api/posts/${encodeURIComponent(slug)}`));
  } catch (error) {
    showToast(error.message, true);
  }
}

function collectPost(draft = true) {
  return {
    slug: slugify(elements.slug.value || elements.title.value),
    previousSlug: state.previousSlug,
    meta: {
      title: elements.title.value.trim() || "Untitled article",
      summary: elements.summary.value.trim(),
      category: elements.category.value.trim() || "Notes",
      tags: elements.tags.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: elements.publishedAt.value,
      difficulty: elements.difficulty.value,
      series: elements.series.value.trim(),
      part: elements.part.value.trim(),
      cover: state.current?.meta.cover || "",
      draft,
      featured: state.current?.meta.featured || false,
      template: state.current?.meta.template || "note"
    },
    content: elements.body.value
  };
}

async function savePost({ draft = true, silent = false } = {}) {
  if (!state.current) return null;
  if (!elements.summary.value.trim()) {
    showToast("Add a summary before saving.", true);
    elements.summary.focus();
    return null;
  }
  try {
    elements.saveStatus.textContent = "Saving…";
    const post = await api("/api/posts", {
      method: "POST",
      body: JSON.stringify(collectPost(draft))
    });
    state.previousSlug = post.slug;
    state.current = post;
    elements.slug.value = post.slug;
    await loadPosts();
    setDirty(false);
    if (!silent) showToast(draft ? "Draft saved." : "Article saved.");
    return post;
  } catch (error) {
    showToast(error.message, true);
    elements.saveStatus.textContent = "Save failed";
    return null;
  }
}

async function publishPost() {
  const post = await savePost({ draft: false, silent: true });
  if (!post) return;
  if (!window.confirm("Commit this article and push it to GitHub?")) return;
  try {
    elements.publish.disabled = true;
    elements.publish.textContent = "Publishing…";
    const result = await api("/api/publish", {
      method: "POST",
      body: JSON.stringify({ slug: post.slug })
    });
    fillEditor(result.post);
    await loadPosts();
    showToast(result.message);
  } catch (error) {
    showToast(
      `Saved locally, but Git publishing failed: ${error.message}`,
      true
    );
  } finally {
    elements.publish.disabled = false;
    elements.publish.textContent = "Publish to GitHub ↗";
  }
}

async function archivePost() {
  if (!state.current || state.current.meta.draft) return;
  if (!window.confirm("Unpublish this article and return it to drafts?")) return;
  try {
    const post = await api("/api/archive", {
      method: "POST",
      body: JSON.stringify({ slug: state.current.slug })
    });
    fillEditor(post);
    await loadPosts();
    showToast("Article returned to drafts. Push the change when ready.");
  } catch (error) {
    showToast(error.message, true);
  }
}

function updateWordCount() {
  const words = elements.body.value.trim().split(/\s+/).filter(Boolean).length;
  elements.wordCount.textContent = `${words} word${words === 1 ? "" : "s"}`;
}

function queuePreview() {
  window.clearTimeout(state.renderTimer);
  state.renderTimer = window.setTimeout(renderPreview, 250);
}

async function renderPreview() {
  try {
    const { html } = await api("/api/render", {
      method: "POST",
      body: JSON.stringify({ content: elements.body.value })
    });
    elements.preview.innerHTML = html;
  } catch {
    elements.preview.innerHTML = "<p>Preview unavailable.</p>";
  }
}

function replaceSelection({ prefix = "", suffix = "", placeholder = "text" }) {
  const field = elements.body;
  const start = field.selectionStart;
  const end = field.selectionEnd;
  const selected = field.value.slice(start, end) || placeholder;
  field.setRangeText(`${prefix}${selected}${suffix}`, start, end, "select");
  field.focus();
  setDirty();
  queuePreview();
}

function prefixLines(prefix) {
  const field = elements.body;
  const start = field.selectionStart;
  const end = field.selectionEnd;
  const selected = field.value.slice(start, end) || "Heading";
  field.setRangeText(
    selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n"),
    start,
    end,
    "select"
  );
  field.focus();
  setDirty();
  queuePreview();
}

async function uploadImage(file) {
  if (!state.current) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const result = await api("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          slug: elements.slug.value,
          name: file.name,
          data: reader.result
        })
      });
      replaceSelection({
        prefix: `![${file.name.replace(/\.[^.]+$/, "")}](`,
        suffix: ")",
        placeholder: result.path
      });
      showToast("Image added to this article.");
    } catch (error) {
      showToast(error.message, true);
    }
  };
  reader.readAsDataURL(file);
}

async function openNewDialog() {
  try {
    const { templates } = await api("/api/templates");
    const labels = {
      bandit: "OverTheWire Bandit walkthrough",
      "learn-linux": "Learn With Me / Linux",
      "learn-python": "Learn With Me / Python",
      "learn-dart-flutter": "Learn With Me / Dart + Flutter",
      "learn-git": "Learn With Me / Git",
      cybersecurity: "Cybersecurity walkthrough",
      linux: "Linux guide",
      flutter: "Flutter tutorial",
      embedded: "Embedded project",
      model: "AI / ML model",
      "case-study": "Engineering case study",
      note: "Short field note"
    };
    state.template = "note";
    elements.templateList.innerHTML = templates
      .map(
        (template) => `
          <label class="template-option ${template === "note" ? "active" : ""}">
            <input type="radio" name="template" value="${template}" ${template === "note" ? "checked" : ""} />
            <span>${labels[template] || template}</span>
            <small>${template}</small>
          </label>
        `
      )
      .join("");
    elements.newTitle.value = "";
    elements.dialog.showModal();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function createPost(event) {
  event.preventDefault();
  const title = elements.newTitle.value.trim();
  if (!title) return;
  try {
    const post = await api("/api/new", {
      method: "POST",
      body: JSON.stringify({ title, template: state.template })
    });
    elements.dialog.close();
    await loadPosts();
    fillEditor(post);
    showToast("Draft created from template.");
  } catch (error) {
    showToast(error.message, true);
  }
}

elements.postList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-slug]");
  if (button) openPost(button.dataset.slug);
});
elements.search.addEventListener("input", renderPostList);
["#new-post", "#empty-new-post"].forEach((selector) =>
  $(selector).addEventListener("click", openNewDialog)
);
elements.newForm.addEventListener("submit", createPost);
elements.templateList.addEventListener("change", (event) => {
  if (event.target.name !== "template") return;
  state.template = event.target.value;
  document.querySelectorAll(".template-option").forEach((option) =>
    option.classList.toggle("active", option.contains(event.target))
  );
});
elements.save.addEventListener("click", () => savePost({ draft: true }));
elements.publish.addEventListener("click", publishPost);
elements.archive.addEventListener("click", archivePost);

document.querySelectorAll(".composer-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".composer-tabs button")
      .forEach((item) => item.classList.toggle("active", item === button));
    elements.panels.className = `composer-panels ${button.dataset.view}`;
    if (button.dataset.view !== "write") renderPreview();
  });
});

document.querySelectorAll(".toolbar [data-wrap]").forEach((button) => {
  button.addEventListener("click", () =>
    replaceSelection({
      prefix: button.dataset.wrap,
      suffix: button.dataset.wrap
    })
  );
});
document.querySelectorAll(".toolbar [data-prefix]").forEach((button) => {
  button.addEventListener("click", () => prefixLines(button.dataset.prefix));
});
$("[data-code]").addEventListener("click", () =>
  replaceSelection({
    prefix: "```text\n",
    suffix: "\n```",
    placeholder: "command or code"
  })
);
$("[data-link]").addEventListener("click", () =>
  replaceSelection({ prefix: "[", suffix: "](https://)", placeholder: "link text" })
);
$("#image-button").addEventListener("click", () => elements.imageInput.click());
elements.imageInput.addEventListener("change", () => {
  const file = elements.imageInput.files[0];
  if (file) uploadImage(file);
  elements.imageInput.value = "";
});

[
  elements.title,
  elements.summary,
  elements.slug,
  elements.category,
  elements.tags,
  elements.difficulty,
  elements.publishedAt,
  elements.series,
  elements.part
].forEach((field) => field.addEventListener("input", () => setDirty()));
elements.title.addEventListener("input", () => {
  if (!state.dirty || elements.slug.value === state.previousSlug) {
    elements.slug.value = slugify(elements.title.value);
  }
});
elements.body.addEventListener("input", () => {
  setDirty();
  updateWordCount();
  queuePreview();
});

window.addEventListener("beforeunload", (event) => {
  if (!state.dirty) return;
  event.preventDefault();
  event.returnValue = "";
});

loadPosts().catch((error) => showToast(error.message, true));
