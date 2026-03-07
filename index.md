---
layout: default
title: "mefly.dev Blog"
---

<h2>Blog</h2>
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <span style="color:#888;font-size:0.9em;">{{ post.date | date: "%b %d, %Y" }}</span>
    </li>
  {% endfor %}
</ul>

<h2>Articles</h2>
<ul>
  {% for article in site.articles %}
    <li>
      <a href="{{ article.url }}">{{ article.title }}</a>
    </li>
  {% endfor %}
</ul>

<h2>Apps</h2>
<ul>
  {% for app in site.apps %}
    <li>
      <a href="{{ app.url }}">{{ app.title }}</a>
    </li>
  {% endfor %}
</ul>
