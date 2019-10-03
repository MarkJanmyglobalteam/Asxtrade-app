import { Http } from '@angular/http';
import { Injectable } from "@angular/core";
import 'rxjs/add/operator/map'
import { env } from '../../app/app.env';

@Injectable()
export class SearchStockProvider {
	labelAttribute = "nameWithSymbol";
	formValueAttribute = "";

	constructor(private _http: Http) {
		console.log('Hello SearchStockProvider Provider');
	}

	getResults(keyword: string) {
		return this._http.get(`${env.URL.dev}/api/companies`)
		.map(result => {
			let final = result.json().map(f => {
				f.nameWithSymbol = `${f.name} (${f.symbol})`
				return f
			})
			return final.filter(function(item){return item.nameWithSymbol.toLowerCase().indexOf(keyword.toLowerCase())>=0;})
		});
	}

}
