﻿/**
Провайдер AnyBalance (http://any-balance-providers.googlecode.com)
*/

var g_headers = {
	'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Charset':'windows-1251,utf-8;q=0.7,*;q=0.3',
	'Accept-Language':'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
	'Connection':'keep-alive',
	'User-Agent':'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0.187 Mobile Safari/534.11+'
};

function main(){
    var prefs = AnyBalance.getPreferences();
    var baseurl = "https://gogetlinks.net/";
    AnyBalance.setDefaultCharset('windows-1251');
	
	checkEmpty(prefs.login, 'Введите логин!');
	checkEmpty(prefs.password, 'Введите пароль!');
	
	var html = AnyBalance.requestGet(baseurl, g_headers);
	
	if(!html || AnyBalance.getLastStatusCode() > 400){
		AnyBalance.trace(html);
		throw new AnyBalance.Error('Ошибка при подключении к сайту провайдера! Попробуйте обновить данные позже.');
	}
	
    html = AnyBalance.requestPost(baseurl + 'login.php', {
        e_mail:prefs.login,
        password:prefs.password,
        remember:''
    }, addHeaders({Referer: baseurl}));
	
    if(!/my_campaigns\.php/i.test(html)){
        var error = getParam(html, null, null, /([^<]+)/i, replaceTagsAndSpaces, html_entity_decode);
        if(error)
            throw new AnyBalance.Error(error, null, /Некорректный Логин или Пароль/i.test(html));
		
        throw new AnyBalance.Error('Не удалось зайти в личный кабинет. Сайт изменен?');
    }

    html = AnyBalance.requestGet(baseurl + 'my_campaigns.php', g_headers);

    var result = {success: true};
	
    getParam(html, result, 'balance', />\s*Баланс\s*<(?:[^>]*>){3}([\s\d.,]+)руб/i, replaceTagsAndSpaces, parseBalance);
    getParam(html, result, 'balanceAvailable', />\s*Доступно\s*<(?:[^>]*>){2}([\s\d.,]+)руб/i, replaceTagsAndSpaces, parseBalance);
    getParam(html, result, 'balanceBlocked', />\s*Блокировано\s*<(?:[^>]*>){2}([\s\d.,]+)руб/i, replaceTagsAndSpaces, parseBalance);

    AnyBalance.setResult(result);
}
