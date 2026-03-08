---
layout: default
title: "Articles"
---

<h2>Articles</h2>
<ul>
  {% assign sorted_articles = site.articles | sort: 'title' %}
  {% for article in sorted_articles %}
    <li>
      <a href="{{ article.url }}">{{ article.title }}</a>
    </li>
  {% endfor %}
</ul>
