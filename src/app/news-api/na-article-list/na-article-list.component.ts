import { Component, OnInit } from '@angular/core';
import { NewsApiService, Article } from '../news-api.service';

@Component({
  selector: 'app-na-article-list',
  templateUrl: './na-article-list.component.html',
  styleUrls: ['./na-article-list.component.css']
})
export class NaArticleListComponent implements OnInit {
  articles: Article[];

  constructor(private newsApiService: NewsApiService) {
    newsApiService.pagesOutput.subscribe(articles => {
      this.articles = articles;
    });
    newsApiService.getPage(1);
  }

  ngOnInit(): void {
  }

}
