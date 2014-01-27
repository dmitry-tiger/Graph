package Graph::Screen;
use Zabapi;
use GraphDb;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub newscreen {
  my $self = shift;

  # Render template "example/welcome.html.ep" with message
  $self->render(msg => 'This is new screen');
}

sub fetch {
  my $self = shift;
  my $id = $self->stash( 'id' );
  my @data;
  
  ###################
  my $user='guest';
  ###################
  my $sth = $self->dbc->run(sub{
    my $sth = $_->prepare("select s.screenid as screenid, s.screenname as screenname, u.username as username from screens s join users u on s.userid = u.userid where s.screentiny = '$id'")
    or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
    };
    $sth->execute or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
    };
    $sth;
  });
    
  if ($sth->rows==0) {
    $self->render(json => {"error"=>"1","error_str"=>"View doesn't exists" });
    return 0;
  }
  my $ref = $sth->fetchrow_hashref();
  my $scr_id = $ref->{'screenid'};
  my $scr_name = $ref->{'screenname'};
  my $scr_user = $ref->{'username'};
  $sth = $self->dbc->run(sub{
    my $sth = $_->prepare("SELECT `width`,`height`,`top`,`left`,`url` FROM graphs where screenid='$scr_id'") 
    or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
    };
    $sth->execute or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
    };
    $sth;
  });
  while ($ref=$sth->fetchrow_hashref()) {
    push @data,{'width'=>$ref->{'width'},'height'=>$ref->{'height'},'top'=>$ref->{'top'},'left'=>$ref->{'left'},'url'=>$ref->{'url'}};
  }
  # Render template "example/welcome.html.ep" with message
  $self->render(json => {"error"=>"0","error_str"=>"", "scr_name" => $scr_name, "scr_user" => $scr_user, "data" => \@data});
  return 1;
}

sub view{
  my $self = shift;
  my $id = $self->stash( 'id' );
  $self->render(goonload => $id, title => "Loading Graph");
}

sub dash {
  my $self = shift;
  my $id = $self->stash( 'id' );
  my $refresh = $self->stash('refresh') || 60;
  $self->render(goonload => $id, title => "Loading Graph", refresh => $refresh);
  
}


sub login{
  my $self = shift;
  my $zserver = $self->stash( 'server' );
#  $self->render(login_status => '1');
#  $self->clog('debug',"Calling login_to_zabbix method with param: $zserver");
#  my $zserverUrl = "http://$zserver.ringcentral.com/api_jsonrpc.php";
#  $self->clog('info',"Trying to login to Zabbix server: $zserverUrl with user: $zabbixAuth->{user}");   
#  my $zabapi = Zabapi->new(server => $zserverUrl, verbosity => '0');
#  my $zabbixAuth = { user => $self->stash->{config}->{zabbix}->{username}, password => $self->stash->{config}->{zabbix}->{password}};
#  $zabapi->login($zabbixAuth);
  my $zabapi = $self->login_to_zabbix($zserver);
  if ($zabapi != -1) {
#    $self->clog('info',"Login to $zserver success");
    $self->session(zserver => $zserver);
#    $self->session(zabapi => $zabapi);
    $self->render(login_status => '0');
#    $self->stash("zabapi" => $zabapi);
#    say "123";
  }
  else {
#  $self->clog('info',"Login to $zserver failed");
  $self->render(login_status => '-1');
  } 
}

sub ajax_get_all_hosts{
	my $self = shift;

#	my $q = $self->query();
#	my $hostGroup = $q->param('host_group');
	my $zserver = $self->session('zserver');
#	my $zabapi = $self->login_to_zabbix($zserver);
#	$self->clog('info',"Send request to Zabbix $zserver for hostlist in group $hostGroup");
        my $zabapi=$self->login_to_zabbix($zserver);
	my $hostList = $zabapi->get_all_hosts;
#	print Dumper $hostList;
#	print $LOGG  Dumper( $hostList );
#	exit;
	return $self->render(json => $hostList);
}

sub ajax_get_items{
  my $self = shift;
  my @hosts =  $self->req->query_params->param('hostids[]');
  my $hostids= join (",", @hosts);
#	print $LOGG  Dumper( $q );
#	print $LOGG  Dumper( @hosts );
#	print $LOGG  Dumper( $hostids	 );
#	exit;
  my $zserver = $self->session('zserver');
  my $zabapi = $self->login_to_zabbix($zserver);
#  $self->clog('info',"Send request to Zabbix $zserver for itemlist");
  my $hostList = $zabapi->get_items_by_hostids($hostids);
  return $self->render(json => $hostList);
}

sub ajax_get_items_by_itemids{
  my $self = shift;
  my @items =  $self->req->query_params->param('itemids[]');
  my $itemids= join (",", @items);
  my $zserver = $self->session('zserver');
  my $zabapi = $self->login_to_zabbix($zserver);
#  $self->clog('info',"Send request to Zabbix $zserver for itemlist");
  my $hostList = $zabapi->get_items_by_itemids($itemids);
  return $self->render(json => $hostList);  
}

sub login_to_zabbix{
  my $self = shift;
  $zserver = shift || "";
  my $zserverUrl = "http://$zserver.ringcentral.com/api_jsonrpc.php";
#  $self->clog('info',"Trying to login to Zabbix server: $zserverUrl with user: $zabbixAuth->{user}");   
  my $zabapi = Zabapi->new(server => $zserverUrl, verbosity => '0');
  my $zabbixAuth = { user => $self->stash->{config}->{zabbix}->{username}, password => $self->stash->{config}->{zabbix}->{password}};
  eval {
  $zabapi->login($zabbixAuth)
  };
  if ($@) {
    $self->render(json => {"error"=>"$@" });
    exit;
  }
  else
  {
    if (defined $zabapi->{cookie}) {
#     $self->clog('info',"Login to $zserver success");
      return $zabapi;
    }
    else {
#     $self->clog('info',"Login to $zserver failed");
      return '-1';
    }
  }
}

sub fork{
  my $self=shift;
  my $json = $self->req->json;
  my $screen_id = $self->req->body_params->param('screen_id');
  my @data = @{$json->{'data'}};
  my $project_name = $self->req->body_params->param('project_name') || 'Unnamed Project';
  my $url = $self->gen_tiny_url(6);
  unless ($self->save_to_db($url,\@data,$project_name)){
#    $self->render(json => {"error"=>"1","error_str"=>"Error save to db" });
    return 0;
  }
  $self->render(json => {"error"=>"0","error_str"=>"", "screen_id" => $url, "screen_name" => $project_name });
}

sub save{
  my $self=shift;
  my $json = $self->req->json;
  my $screen_id = $json->{'screen_id'};
  my @data = @{$json->{'data'}};
  my $project_name = $json->{'screen_name'} || 'Unnamed Project';
  $project_name =~ s/[^a-zA-Z0-9 .,\-\+\(\)\%\#\$\@!]//;
  $screen_id =~ s/[^a-zA-Z0-9]//;
  my $url = ($screen_id eq "") ? $self->gen_tiny_url(6) : $screen_id;
  unless ($self->save_to_db($url,\@data,$project_name)){
#    $self->render(json => {"error"=>"1","error_str"=>"Error save to db" });
    return 0;
  }
  $self->render(json => {"error"=>"0","error_str"=>"", "screen_id" => $url, "screen_name" => $project_name });
#  my $url = $self->gen_tiny_url(6);
#  say $url;
}

sub delete{
  my $self=shift;
  my $user = 'quest';
  my $json = $self->req->json;
  my $url = $json->{'screen_id'}||0;
  unless ($url){
    $self->render(json => {"error"=>"1","error_str"=>"Screen id was empty" });
    return 0;
  }
  if ($self->is_user_authenticated){
   $user = $self->user->[0];
  }
  my $sth = $self->dbc->run(sub{
      my $sth=$_->prepare("select s.screenid as screenid, u.username as username from screens s join users u on s.userid = u.userid where s.screentiny = '$url'")
      or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
      };
      $sth->execute or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth;
  });
  my $ref = $sth->fetchrow_hashref();
  my $user_name = $ref->{'username'};
  unless ($user_name eq $user) {
    $self->render(json => {"error"=>"1","error_str"=>"You don't have permission to detele this project" });
    return 0;
  }
  
  my $screen_id = $ref->{'screenid'};
  $sth = $self->dbc->run(sub{
    my $sth = $_->prepare("delete from screens where screenid='$screen_id'")or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
    };
    $sth->execute or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
    };
    $sth;
  });
  $self->render(json => {"error"=>"0","error_str"=>"" });
  
}

sub gen_tiny_url{
  my $self=shift;
  my $len=shift;
  my $tiny="";
  while (1) {
  my @printable=('a'..'z','A'..'Z','0'..'9');
  $tiny=join "",map {$printable[rand(scalar @printable)]} 1..$len;
#  my $mydbc = GraphDb->new();
#  last if $mydbc->check_url($tiny,$self->db);
  last if $self->check_url($tiny);
  }
  return $tiny;
}

sub check_url{
    my $self=shift;
    my $url=shift;
#    $self->db->connect;
    my $sth = $self->dbc->run(sub {
      $_->do("select * from screens where screentiny = '$url'");
    });
    #my $res = $sth->execute;
    $sth eq '0E0' ? return(1) : return(0);
#    print $res;
}

sub save_to_db{
  my $self=shift;
  my $url=shift;
  my $data=shift;
  my $project_name=shift;
  ###################
  my $userid=1;
  my $user='guest';
  if ($self->is_user_authenticated){
    $user = $self->user->[0];
    my $sth = $self->dbc->run(sub {
      my $sth = $_->prepare("select userid from users where username = '$user'")
      or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth->execute or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth;
    });
    if ($sth->rows > 0){
      my $ref = $sth->fetchrow_hashref();
      $userid = $ref->{'userid'} or do {
        $self->render(json => {"error"=>"1","error_str"=>"Unknown userid" });
        return 0;
      };
    }
    else{
      $sth = $self->dbc->run(sub {
        my $sth = $_->prepare("insert into users set `username` = '$user';")or do {
          $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
          return 0;
        };
        $sth->execute or do {
          $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
          return 0;
        };
        $sth;
      });
    $userid = $sth->{mysql_insertid};
    }
  }
  else{
    $self->render(json => {"error"=>"1","error_str"=>"Guests couldn't save or fork projects. Please log in." });
    return 0;
  }
  ###################
  my $sth = $self->dbc->run(sub {
    my $sth = $_->prepare("select s.screenid, u.username from screens s join users u on s.userid = u.userid where s.screentiny = '$url'") 
    or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
    };
    $sth->execute or do {
      $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
      return 0;
      };
    $sth;
  });
  if ($sth->rows==0) {
#    say "insert into screens (`screentiny`,`screenname`,`userid`)  values ('$url','$project_name','$userid')";
    $sth = $self->dbc->run(sub {
      my $sth = $_->prepare("insert into screens (`screentiny`,`screenname`,`userid`)  values ('$url','$project_name','$userid');")or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth->execute or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth;
    });
    my $scid = $sth->{mysql_insertid};
    foreach my $elem (@$data){
      $elem->{item_width} =~ s/[^0-9px]//;
      $elem->{item_height} =~ s/[^0-9px]//;
      $elem->{item_top} =~ s/[^0-9px\-]//;
      $elem->{item_left} =~ s/[^0-9px\-]//;
#      say "insert into graphs (`width`,`height`,`top`,`left`,`url`,`screenid`) values ('".$elem->{item_width}."','".$elem->{item_height}."','".$elem->{item_top}."','".$elem->{item_left}."','".$elem->{item_img}."','$scid') ";
      $sth = $self->dbc->run(sub {
        my $sth = $_->prepare("insert into graphs (`width`,`height`,`top`,`left`,`url`,`screenid`) values ('".$elem->{item_width}."','".$elem->{item_height}."','".$elem->{item_top}."','".$elem->{item_left}."','".$elem->{item_img}."','$scid');")or do {
          $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
          return 0;
        };
        $sth->execute or do {
          $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
          return 0;
        };
        $sth;
      });
    }
  }
  else{
    my $ref = $sth->fetchrow_hashref();
    my $user_name = $ref->{'username'};
    unless ($user_name eq $user) {
      $self->render(json => {"error"=>"1","error_str"=>"You don't have permission to save this project" });
      return 0;
    }
    my $screen_id = $ref->{'screenid'};
    $sth = $self->dbc->run(sub {
      my $sth = $_->prepare("update screens set screentiny='$url', screenname='$project_name'  where screenid='$screen_id';")or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth->execute or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth;
    });
    $sth = $self->dbc->run(sub {
      my $sth = $_->prepare("delete from graphs where screenid='$screen_id'")or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth->execute or do {
        $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
        return 0;
      };
      $sth;
    });
    foreach my $elem (@$data){
      $elem->{item_width} =~ s/[^0-9px]//;
      $elem->{item_height} =~ s/[^0-9px]//;
      $elem->{item_top} =~ s/[^0-9px\-]//;
      $elem->{item_left} =~ s/[^0-9px\-]//;
      $sth = $self->dbc->run(sub {
        my $sth = $_->prepare("insert into graphs (`width`,`height`,`top`,`left`,`url`,`screenid`) values
                                ('".$elem->{item_width}."','".$elem->{item_height}."','".$elem->{item_top}."','".$elem->{item_left}."','".$elem->{item_img}."','$screen_id');") or do {
          $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
          return 0;
        };
        $sth->execute or do {
          $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
          return 0;
        };
        $sth;
      });
    }
  }
  return 1;
  
}

1;