package Graph::Eanalyzer;

use DateTime;
use Zabapi;
use Mojo::Base 'Mojolicious::Controller';

sub new_ea{
    my $self=shift;
}

sub getevents{
    my $self=shift;
    my $json = $self->req->json;
    (my $zserver = $json->{'zserver'}) =~ m/^[\w-\.]+$/ or do {$self->render(json => {"error"=>"1","error_str"=>"zserver not specified or invalid"});return;};
    my @from_date = $json->{'from_date'} =~ m/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/ or do {$self->render(json => {"error"=>"1","error_str"=>"from_date not specified or invalid"});return;};
    my @to_date = $json->{'to_date'} =~ m/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/ or do {$self->render(json => {"error"=>"1","error_str"=>"to_date not specified or invalid"});return;};
    my $fdt = DateTime->new(
      year       => $from_date[0],
      month      => $from_date[1],
      day        => $from_date[2],
      hour       => $from_date[3],
      minute     => $from_date[4],
      second     => 00,
      );
    my $tdt = DateTime->new(
      year       => $to_date[0],
      month      => $to_date[1],
      day        => $to_date[2],
      hour       => $to_date[3],
      minute     => $to_date[4],
      second     => 00,
      );
    if ( ($fdt->epoch()) > ($tdt->epoch())){
        return $self->render(json => {"error"=>"1","error_str"=>"Wrong period" });
    }
    if ((($tdt->epoch())-($fdt->epoch()))>86401) {
        return $self->render(json => {"error"=>"1","error_str"=>"Period is more than maximum period size (1 day)" });
    }
    
    my $zabapi = $self->zapilogin($zserver);
    unless (ref($zabapi)){
        $self->render(json => {"error"=>"1", ,"error_str"=>"Error $zabapi" });
        return 0;
    }
    my $hostList = $zabapi->get_triggers_by_time($fdt->epoch(),$tdt->epoch());
    $self->app->log->debug("keys".keys(%$hostList));
    return $self->render(json => $hostList);
}

sub gengraph{
    my $self=shift;
    my ($timediff,$stime,@urls);
    my $json = $self->req->json;    
    my @from_date = $json->{'from_date'} =~ m/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/ or do {$self->render(json => {"error"=>"1","error_str"=>"from_date not specified or invalid"});return;};
    my @to_date = $json->{'to_date'} =~ m/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/ or do {$self->render(json => {"error"=>"1","error_str"=>"to_date not specified or invalid"});return;};
    my $fdt = DateTime->new(
      year       => $from_date[0],
      month      => $from_date[1],
      day        => $from_date[2],
      hour       => $from_date[3],
      minute     => $from_date[4],
      second     => 00,
      );
    my $tdt = DateTime->new(
      year       => $to_date[0],
      month      => $to_date[1],
      day        => $to_date[2],
      hour       => $to_date[3],
      minute     => $to_date[4],
      second     => 00,
      );
    if ( ($fdt->epoch()) > ($tdt->epoch())){
        return $self->render(json => {"error"=>"1","error_str"=>"Wrong period" });
    }
    if ((($tdt->epoch())-($fdt->epoch()))>86401) {
        return $self->render(json => {"error"=>"1","error_str"=>"Period is more than maximum period size (1 day)" });
    }
    $timediff=(($tdt->epoch())-($fdt->epoch()))+3600;
    $fdt->subtract(hours=>1);
    $stime= $fdt->strftime("%G%m%d%H%M00");
    (my $zserver = $json->{'zserver'}) =~ m/^[\w-]+$/ or do {$self->render(json => {"error"=>"1","error_str"=>"zserver not specified or invalid"});return;};
    my @items = @{$json->{'data'}};
    foreach my $item (@items){
        my $url="http://$zserver".$self->stash->{config}->{zabbix}->{domain}.
        "//zab_chart2.php?itemid[]=$item&color[]=48995e&drawtype[]=0&".
        "legend=1&height=300&width=800&period=$timediff&graphtype=0&showtriggers=1&stime=$stime";
        push @urls,$url;
    }
    return $self->render(json => {"error"=>"0","error_str"=>"","urls"=>\@urls });
}

1;