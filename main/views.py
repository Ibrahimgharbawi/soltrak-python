from django.shortcuts import render
from django.http import HttpResponse
import cfscrape

class StockMarketScraper:
    s = cfscrape.create_scraper(delay=3)
    results = []

    def fetch(self, url):
        response = self.s.get(url)
        return response

    def run(self, site):
        response = self.fetch(site)
        if response.status_code == 200:
            json_response = response.json()
            #print(json_response)
            return json_response
        else:
            return 'Something has gone wrong, please check url'

def index(request):
    site = request.GET['url_to_call']
    #return HttpResponse(site)
    scraper = StockMarketScraper()
    response = scraper.run(site)
    return HttpResponse(str(response))

def test(request):
    return HttpResponse("str(response)")
