---
layout: default
title: Articles
---

<h2>Articles</h2>

{% if site.articles.size > 0 %}
<ul>
  {% for article in site.articles %}
    <li>
      <a href="{{ article.url }}">{{ article.title }}</a>
    </li>
  {% endfor %}
</ul>
{% else %}
<p>No articles yet.</p>
{% endif %}
