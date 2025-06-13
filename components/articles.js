import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await axios.get('/api/articles');
      setArticles(response.data);
    };

    fetchArticles();
  }, []);

  return (
    <div>
      {articles.map(article => (
        <div key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ArticleList;

// я так понимаю ты просто должна обращаться к моему коду и тут нет такого как мы в кр делали, я скопировала пример из чата гпт