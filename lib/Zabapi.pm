package Zabapi;

use base Zabbix::API;
use Data::Dumper;

sub get_all_hosts() {
	my $self = shift;
	my %hostList;
	my ($key,$value);
	my $params = {
		output => ["host","hostid","status"]
      
	};
#		my $params = {
#		output => ["host","hostid"],
#        	search => {host => $name_pattern},
#	};
	my $hostListRaw = $self->query( method => "host.get", params => $params);
	for ( my $i = 0; $i<@$hostListRaw; $i++ ) 
	{
		$key = $hostListRaw->[$i]->{hostid};
		$value = $hostListRaw->[$i]->{host};
                $status = $hostListRaw->[$i]->{status};
#		$hostList{$key} .= $value;
                $hostList{$key} = [$value,$status];
                
	}
	return \%hostList;
}

sub get_items_by_hostids
{
        my ($self, $hostids ) = @_;
        my %itemList;
        my ($key,$value,$hostkey,$hostid,$lastvalue,$status);
#        my $groupId = $self->group_id($groupName);
	my @hostids = split(",",$hostids);
        my $params = {
                output => ["name","itemid","key_","hostid","status","lastclock"],
                hostids => \@hostids,
		filter => {flags => [0,4]}
        };
#	print $LOGG  Dumper( $params );
        my $hostListRaw = $self->query( method => "item.get", params => $params);
#	print $LOGG  Dumper( $hostListRaw );
        for ( my $i = 0; $i<@$hostListRaw; $i++ )
        {
                $value = $hostListRaw->[$i]->{name};
                $key = $hostListRaw->[$i]->{itemid};
		$hostkey = $hostListRaw->[$i]->{key_};
		$hostid = $hostListRaw->[$i]->{hostid};
                $status = $hostListRaw->[$i]->{status};
                $lastvalue = $hostListRaw->[$i]->{lastclock};
                $itemList{$key}=[$value,$hostkey,$hostid,$status,$lastvalue];
        }
        return \%itemList;
}

sub get_items_by_itemids
{
        my ($self, $itemids ) = @_;
        my %itemList;
        my ($key,$value,$hostkey,$hostid,$status,$lastvalue);
#        my $groupId = $self->group_id($groupName);
	my @itemids = split(",",$itemids);
        my $params = {
                output => ["name","itemid","key_","hostid","status","lastclock"],
                itemids => \@itemids,
		filter => {flags => [0,4]}
        };
#	print $LOGG  Dumper( $params );
        my $hostListRaw = $self->query( method => "item.get", params => $params);
#	print $LOGG  Dumper( $hostListRaw );
        for ( my $i = 0; $i<@$hostListRaw; $i++ )
        {
                $value = $hostListRaw->[$i]->{name};
                $key = $hostListRaw->[$i]->{itemid};
		$hostkey = $hostListRaw->[$i]->{key_};
		$hostid = $hostListRaw->[$i]->{hostid};
                $status = $hostListRaw->[$i]->{status};
                $lastvalue = $hostListRaw->[$i]->{lastclock};
                $itemList{$key}=[$value,$hostkey,$hostid,$status,$lastvalue];
        }
        return \%itemList;
}

sub get_triggers_by_time {
	my ($self, $frt, $tot ) = @_;
	my %events;
	my (@hostids,@maintenaceids,%mhosts);
	open($LOGG, ">/tmp/dump") or die "cant open dump";
	open($LOGG2, ">/tmp/dumper") or die "cant open dump";
	my $params = {
                output => "extend",
		object => "0",
		value => 1,
		selectTriggers => "extend",
		selectItems => "extend",
		selectHosts => "extend",
                time_from => $frt,
		time_till => $tot
        };
	my $eventListRaw = $self->query( method => "event.get", params => $params);
#	print $LOGG  Dumper($eventListRaw);return;
	for ( my $i = 0; $i<@$eventListRaw; $i++ ){
		$events{$eventListRaw->[$i]->{eventid}}{clock}=$eventListRaw->[$i]->{clock};
#		$events{$eventListRaw->[$i]->{objectid}}{host}{name}=$eventListRaw->[$i]->{host}->[0]->{name};
#		$events{$eventListRaw->[$i]->{objectid}}{host}{hostid}=$eventListRaw->[$i]->{host}->[0]->{hostid};
#		print $LOGG2  Dumper( \$eventListRaw->[$i]);
		foreach my $host  (@{$eventListRaw->[$i]->{hosts}}){
			$events{$eventListRaw->[$i]->{eventid}}{hosts}{$host->{hostid}}{name} = $host->{name};
			my $tmpvar = $host->{hostid};
			push @hostids, $tmpvar if !grep{/^$tmpvar$/}@hostids;
		}
		foreach my $trigger  (@{$eventListRaw->[$i]->{triggers}}){
			$events{$eventListRaw->[$i]->{eventid}}{triggers}{$trigger->{triggerid}}{description}= $trigger->{description};
			$events{$eventListRaw->[$i]->{eventid}}{triggers}{$trigger->{triggerid}}{priority} = $trigger->{priority};
		}
		foreach my $item  (@{$eventListRaw->[$i]->{items}}){
			$events{$eventListRaw->[$i]->{eventid}}{items}{$item->{itemid}}{name} = $item->{name};
		}
#		push @triggers, $tmpvar; if !grep{/^$tmpvar$/}@triggers;
#	return;
	}
#	print $LOGG  Dumper( %events );
#	my @triggerids = sort keys(%events);
	$params = {
            	filter => {timeperiod_type => '0'},
                output => "extend",
		hostids => \@hostids,
		selectHosts => "extend",

        };
	my $maintenanceListRaw = $self->query( method => "maintenance.get", params => $params);
#	print $LOGG  Dumper( $maintenanceListRaw );return;
	for ( my $i = 0; $i<@$maintenanceListRaw; $i++ ){
            if ($maintenanceListRaw->[$i]->{'active_since'}<=$tot && $maintenanceListRaw->[$i]->{'active_till'}>=$frt){
                push @maintenaceids,$maintenanceListRaw->[$i]->{'maintenanceid'};
            }
            
	}
        $params = {
            filter => {timeperiod_type => '0'},
            output => "extend",
	    maintenanceids => \@maintenaceids,
	    selectHosts => "extend",
        };
	$maintenanceListRaw = $self->query( method => "maintenance.get", params => $params);
	for ( my $i = 0; $i<@$maintenanceListRaw; $i++ ){
            foreach my $cur_maintenance (@{$maintenanceListRaw->[$i]->{'hosts'}}){
                foreach my $cur_event (keys %events){
                    $events{$cur_event}->{'hosts'}->{$cur_maintenance->{'hostid'}}->{'maintenance'}=1 if
                    ((exists $events{$cur_event}->{'hosts'}->{$cur_maintenance->{'hostid'}}) && (($maintenanceListRaw->[$i]->{active_till} >= $events{$cur_event}->{'clock'}) && ($events{$cur_event}->{'clock'} >= $maintenanceListRaw->[$i]->{active_since})));
                }
                
            }
        }
	return \%events;
}

1;