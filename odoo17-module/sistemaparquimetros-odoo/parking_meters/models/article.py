from odoo import models, fields, api
import json

class Article(models.Model):
    _name = "parking_meters.article"
    _description = "Articles"
    _rec_name = "article"

    id = fields.Integer(string="Id")
    article = fields.Char(string="Article")
    definition = fields.Char(string="Definition")
    title = fields.Char(string="Title")

    @api.model
    def get_articles_with_clauses(self):
        articles = self.search([])
        articles_with_clauses = []

        for article in articles:
            clauses = self.env['parking_meters.clause'].search([('article_code_id', '=', article.id)])
            article_data = {
                'id': article.id,
                'article': article.article,
                'definition': article.definition,
                'title': article.title,
                'clauses': [{
                    'id': clause.id,
                    'name': clause.name,
                    'description': clause.description,
                    'title': clause.title
                } for clause in clauses]
            }
            articles_with_clauses.append(article_data)
        return json.dumps({"data": articles_with_clauses})
    
    
    def create(self, vals):
        res = super(Article, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(Article, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env["res.users"].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = "outdated"

    

