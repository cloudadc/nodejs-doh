when HTTP_REQUEST {
    
    set urid "?[URI::query [HTTP::uri]]"
    set name "[URI::query $urid name]"
    set type "[URI::query $urid type]"
    
    set plugin [ILX::init doh_plugin DoH]
    set rb [ILX::call $plugin dnsResolve $name $type]
    HTTP::respond 200 -version 1.1 content "$rb" "Cache-Control" "no-cache"
}
